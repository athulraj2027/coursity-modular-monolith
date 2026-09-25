import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { VerifyCoursePaymentDto } from "../../domain/dtos/enrollment.dto";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { TeacherCouponRepository } from "@/modules/coupon/domain/repositories/teacher-coupon.repository";
import { IPaymentGateway } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class VerifyCoursePaymentUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly couponRepo: TeacherCouponRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) {}

  async execute(studentId: string, dto: VerifyCoursePaymentDto): Promise<CourseEnrollmentEntity> {
    // 1. Verify Razorpay Payment Signature
    const isSignatureValid = this.paymentGateway.verifyPaymentSignature({
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
      signature: dto.razorpaySignature,
    });

    if (!isSignatureValid) {
      throw new BadRequestError("Invalid payment signature. Verification failed.");
    }

    // 2. Fetch Course & Teacher Details
    const course = await defaultPrisma.course.findUnique({
      where: { id: dto.courseId },
      include: {
        teacherProfile: {
          include: {
            profile: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    const student = await defaultPrisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundError("Student not found.");
    }

    const originalPrice = Number(course.price);
    let discountAmount = 0;
    let teacherCouponId: string | undefined;
    let appliedCouponCode: string | undefined;

    // 3. Process Coupon Discount if used
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

    // 4. Handle Wallet Balance Deduction if applicable
    if (walletDeduction > 0) {
      const studentWallet = await defaultPrisma.wallet.findUnique({
        where: { userId: studentId },
      });
      if (studentWallet) {
        const currentBal = Number(studentWallet.balance);
        const newBal = Math.max(0, currentBal - walletDeduction);
        await defaultPrisma.$transaction([
          defaultPrisma.wallet.update({
            where: { id: studentWallet.id },
            data: {
              balance: newBal,
              totalSpent: { increment: walletDeduction },
            },
          }),
          defaultPrisma.walletTransaction.create({
            data: {
              walletId: studentWallet.id,
              type: "ENROLLMENT_PAYMENT",
              direction: "DEBIT",
              amount: walletDeduction,
              balanceBefore: currentBal,
              balanceAfter: newBal,
              description: `Partial wallet payment for live course "${course.title}"`,
              referenceType: "ENROLLMENT",
              referenceId: course.id,
              razorpayOrderId: dto.razorpayOrderId,
              razorpayPaymentId: dto.razorpayPaymentId,
            },
          }),
        ]);
      }
    }

    // 5. Calculate 20-Day Refund Window
    const now = new Date();
    const effectiveStart = course.startingDate && new Date(course.startingDate) > now
      ? new Date(course.startingDate)
      : now;
    const refundEligibleUntil = new Date(effectiveStart.getTime() + 20 * 24 * 60 * 60 * 1000);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Create Enrollment Record
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

    // 7. Credit Teacher Royalty Earnings (85% standard share)
    const teacherUserId = course.teacherProfile?.profile?.userId;
    if (teacherUserId) {
      const teacherRoyaltyRate = 0.85;
      const teacherEarnings = Number((finalAmount * teacherRoyaltyRate).toFixed(2));
      if (teacherEarnings > 0) {
        let teacherWallet = await defaultPrisma.wallet.findUnique({
          where: { userId: teacherUserId },
        });
        if (!teacherWallet) {
          teacherWallet = await defaultPrisma.wallet.create({
            data: { userId: teacherUserId, balance: 0 },
          });
        }
        const currentTeacherBal = Number(teacherWallet.balance);
        const newTeacherBal = currentTeacherBal + teacherEarnings;
        await defaultPrisma.$transaction([
          defaultPrisma.wallet.update({
            where: { id: teacherWallet.id },
            data: {
              balance: newTeacherBal,
              totalEarned: { increment: teacherEarnings },
            },
          }),
          defaultPrisma.walletTransaction.create({
            data: {
              walletId: teacherWallet.id,
              type: "EARNING",
              direction: "CREDIT",
              amount: teacherEarnings,
              balanceBefore: currentTeacherBal,
              balanceAfter: newTeacherBal,
              description: `Sales revenue royalty (85%) for student enrollment in "${course.title}"`,
              referenceType: "ENROLLMENT",
              referenceId: enrollment.id,
            },
          }),
        ]);
      }
    }

    // 8. Dispatch Confirmation Email
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
