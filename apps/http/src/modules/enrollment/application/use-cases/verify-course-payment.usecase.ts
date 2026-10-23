import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { VerifyCoursePaymentDto } from "../../domain/dtos/enrollment.dto";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { TeacherCouponRepository } from "@/modules/coupon/domain/repositories/teacher-coupon.repository";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IWalletRepository } from "@/modules/wallet/domain/repositories/wallet.repository.interface";
import { IPaymentVerificationGateway } from "@/shared/application/ports/payment.port";
import { ICustomEmailNotifier } from "@/shared/application/ports/email.port";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class VerifyCoursePaymentUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly couponRepo: TeacherCouponRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly userRepo: UserRepository,
    private readonly walletRepo: IWalletRepository,
    private readonly paymentGateway: IPaymentVerificationGateway,
    private readonly emailService: ICustomEmailNotifier
  ) {}

  async execute(studentId: string, dto: VerifyCoursePaymentDto): Promise<CourseEnrollmentEntity> {
    // 1. Check existing enrollment status (Idempotent retry vs. conflict/refunded)
    const existingEnrollment = await this.enrollmentRepo.findEnrollmentByStudentAndCourse(studentId, dto.courseId);
    if (existingEnrollment) {
      if (existingEnrollment.status === "ACTIVE") {
        if (
          (dto.razorpayPaymentId && existingEnrollment.razorpayPaymentId === dto.razorpayPaymentId) ||
          (dto.razorpayOrderId && existingEnrollment.razorpayOrderId === dto.razorpayOrderId)
        ) {
          return existingEnrollment;
        }
        throw new ConflictError("You are already actively enrolled in this course.");
      }
      if (existingEnrollment.status === "REFUNDED") {
        throw new BadRequestError("You previously claimed a full refund for this course under our 20-Day Guarantee and are not eligible to re-enroll.");
      }
      if (existingEnrollment.status === "CANCELLED") {
        throw new BadRequestError("Your previous enrollment for this course was cancelled and is not eligible for re-enrollment.");
      }
    }

    // 2. Verify Razorpay Payment Signature
    const isSignatureValid = this.paymentGateway.verifyPaymentSignature({
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
      signature: dto.razorpaySignature,
    });

    if (!isSignatureValid) {
      throw new BadRequestError("Invalid payment signature. Verification failed.");
    }

    // 3. Fetch Course & Teacher Details
    const course = await this.courseRepo.findById(dto.courseId);

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    const student = await this.userRepo.findById(studentId);

    if (!student) {
      throw new NotFoundError("Student not found.");
    }

    const originalPrice = Number(course.price);
    let discountAmount = 0;
    let teacherCouponId: string | undefined;
    let appliedCouponCode: string | undefined;

    // 4. Process Coupon Discount if used
    if (dto.couponCode) {
      const coupon = await this.couponRepo.findByCode(dto.couponCode);
      if (coupon && coupon.isActive) {
        teacherCouponId = coupon.id;
        appliedCouponCode = coupon.code;
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (originalPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, originalPrice);
        await this.couponRepo.incrementUsedCount(coupon.id);
      }
    }

    const finalAmount = Math.max(0, originalPrice - discountAmount);
    const walletDeduction = dto.walletDeductionAmount ? Number(dto.walletDeductionAmount) : 0;
    const paymentMethod = walletDeduction > 0 ? "SPLIT" : "RAZORPAY";

    // 5. Handle Wallet Balance Deduction if applicable
    if (walletDeduction > 0) {
      await this.walletRepo.debit({
        userId: studentId,
        amount: walletDeduction,
        type: "ENROLLMENT_PAYMENT",
        description: `Partial wallet payment for live course "${course.title}"`,
        referenceType: "ENROLLMENT",
        referenceId: course.id,
      });
    }

    // 6. Calculate 20-Day Refund Window
    const now = new Date();
    const effectiveStart = course.startingDate && new Date(course.startingDate) > now
      ? new Date(course.startingDate)
      : now;
    const refundEligibleUntil = new Date(effectiveStart.getTime() + 20 * 24 * 60 * 60 * 1000);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 7. Create Enrollment Record
    const enrollment = await this.enrollmentRepo.createEnrollment({
      studentId,
      courseId: course.id,
      originalPrice,
      discountAmount,
      finalAmount,
      currency: course.currency || "INR",
      paymentMethod,
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      invoiceNumber,
      teacherCouponId,
      appliedCouponCode,
      refundEligibleUntil,
    });

    // 8. Credit Teacher Royalty Earnings (85% standard share)
    const teacherUserId = course.teacherProfile?.profile?.userId || course.teacherProfile?.profile?.user?.id;
    if (teacherUserId) {
      const teacherRoyaltyRate = 0.85;
      const teacherEarnings = Number((finalAmount * teacherRoyaltyRate).toFixed(2));
      if (teacherEarnings > 0) {
        await this.walletRepo.credit({
          userId: teacherUserId,
          amount: teacherEarnings,
          type: "EARNING",
          description: `Sales revenue royalty (85%) for student enrollment in "${course.title}"`,
          referenceType: "ENROLLMENT",
          referenceId: enrollment.id,
        });
      }
    }

    // 9. Dispatch Confirmation Email
    if (student.email) {
      this.emailService
        .sendCustomEmail({
          to: student.email,
          subject: `Enrollment Confirmed: ${course.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2>Welcome to ${course.title}!</h2>
              <p>Hi ${student.name},</p>
              <p>Your enrollment in <strong>${course.title}</strong> has been successfully confirmed.</p>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> ₹${finalAmount.toFixed(2)}</p>
              ${course.startingDate ? `<p><strong>Live Batch Starts:</strong> ${new Date(course.startingDate).toLocaleDateString()}</p>` : ""}
              <p><strong>20-Day Refund Guarantee:</strong> You are eligible for a 100% full refund within 20 days or before 4 live classes have been conducted.</p>
              <p>Happy Learning!<br/>The Coursity Team</p>
            </div>
          `,
          text: `Your enrollment in ${course.title} is confirmed. Invoice: ${invoiceNumber}. Amount: ₹${finalAmount.toFixed(2)}.`,
        })
        .catch((err) => console.warn("⚠️ Failed to dispatch enrollment email:", err));
    }

    return enrollment;
  }
}
