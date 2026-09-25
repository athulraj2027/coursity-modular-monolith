import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { PayWithWalletDto } from "../../domain/dtos/enrollment.dto";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { TeacherCouponRepository } from "@/modules/coupon/domain/repositories/teacher-coupon.repository";
import { IEmailService } from "@/infrastructure/email";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, ConflictError, NotFoundError } from "@/app/errors";

export class PayWithWalletUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly couponRepo: TeacherCouponRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(studentId: string, dto: PayWithWalletDto): Promise<CourseEnrollmentEntity> {
    const course = await defaultPrisma.course.findUnique({
      where: { id: dto.courseId },
      include: {
        teacherProfile: {
          include: { profile: { include: { user: true } } },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found.");
    }

    if (course.isFrozen || course.isDeleted) {
      throw new BadRequestError("This course is currently not accepting enrollments.");
    }

    const existing = await this.enrollmentRepo.findEnrollmentByStudentAndCourse(studentId, dto.courseId);
    if (existing && existing.status === "ACTIVE") {
      throw new ConflictError("You are already enrolled in this live course.");
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

    // Apply Coupon
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

    // Verify student wallet balance if payment amount is greater than 0
    if (finalAmount > 0) {
      const wallet = await defaultPrisma.wallet.findUnique({
        where: { userId: studentId },
      });
      const currentBalance = wallet ? Number(wallet.balance) : 0;
      if (!wallet || currentBalance < finalAmount) {
        throw new BadRequestError(
          `Insufficient wallet balance. Available: ₹${currentBalance.toFixed(2)}, Required: ₹${finalAmount.toFixed(2)}.`
        );
      }

      // Debit student wallet
      const newStudentBal = currentBalance - finalAmount;
      await defaultPrisma.$transaction([
        defaultPrisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newStudentBal,
            totalSpent: { increment: finalAmount },
          },
        }),
        defaultPrisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "ENROLLMENT_PAYMENT",
            direction: "DEBIT",
            amount: finalAmount,
            balanceBefore: currentBalance,
            balanceAfter: newStudentBal,
            description: `Full wallet payment for live course "${course.title}"`,
            referenceType: "ENROLLMENT",
            referenceId: course.id,
          },
        }),
      ]);
    }

    // Calculate 20-Day Refund Window
    const now = new Date();
    const effectiveStart = course.startingDate && new Date(course.startingDate) > now
      ? new Date(course.startingDate)
      : now;
    const refundEligibleUntil = new Date(effectiveStart.getTime() + 20 * 24 * 60 * 60 * 1000);
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Enrollment
    const enrollment = await this.enrollmentRepo.createEnrollment({
      studentId,
      courseId: course.id,
      originalPrice,
      discountAmount,
      finalAmount,
      currency: course.currency || "INR",
      paymentMethod: "WALLET",
      invoiceNumber,
      teacherCouponId,
      appliedCouponCode,
      refundEligibleUntil,
    });

    // Credit Teacher Royalty Earnings (85%)
    const teacherUserId = course.teacherProfile?.profile?.userId;
    if (teacherUserId) {
      const teacherEarnings = Number((finalAmount * 0.85).toFixed(2));
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
              description: `Sales revenue royalty (85%) for student wallet enrollment in "${course.title}"`,
              referenceType: "ENROLLMENT",
              referenceId: enrollment.id,
            },
          }),
        ]);
      }
    }

    // Dispatch Email
    if (student.email) {
      this.emailService
        .sendCustomEmail({
          to: student.email,
          subject: `Enrollment Confirmed: ${course.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2>Welcome to ${course.title}!</h2>
              <p>Hi ${student.name},</p>
              <p>Your enrollment in <strong>${course.title}</strong> has been confirmed via Wallet payment.</p>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> ₹${finalAmount.toFixed(2)}</p>
              <p><strong>20-Day Refund Guarantee:</strong> You are eligible for a 100% full refund within 20 days or before 4 live classes have been conducted.</p>
              <p>Happy Learning!<br/>The Coursity Team</p>
            </div>
          `,
          text: `Your enrollment in ${course.title} is confirmed via Wallet. Amount: ₹${finalAmount.toFixed(2)}.`,
        })
        .catch((err) => console.warn("⚠️ Failed to dispatch enrollment email:", err));
    }

    return enrollment;
  }
}
