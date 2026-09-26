import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { RequestCourseRefundDto } from "../../domain/dtos/enrollment.dto";
import { CourseRefundEntity } from "../../domain/entities/refund.entity";
import { IPaymentGateway } from "@/infrastructure/payment";
import { IEmailService } from "@/infrastructure/email";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class RequestCourseRefundUseCase {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly emailService: IEmailService
  ) {}

  async execute(studentId: string, dto: RequestCourseRefundDto): Promise<CourseRefundEntity> {
    // 1. Fetch Enrollment with Course & Teacher
    const enrollment = await this.enrollmentRepo.findEnrollmentById(dto.enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment not found.");
    }

    if (enrollment.studentId !== studentId) {
      throw new BadRequestError("You do not own this enrollment.");
    }

    if (enrollment.status === "REFUNDED") {
      throw new BadRequestError("This course enrollment has already been refunded.");
    }

    if (enrollment.status !== "ACTIVE") {
      throw new BadRequestError(`Cannot refund enrollment with status '${enrollment.status}'.`);
    }

    const refundAmount = enrollment.finalAmount;
    if (refundAmount <= 0) {
      throw new BadRequestError("Cannot process a monetary refund for a free enrollment.");
    }

    // 2. Policy Check: 20 Calendar Days
    const now = new Date();
    const enrolledDate = new Date(enrollment.enrolledAt);
    const startingDate = enrollment.courseStartingDate ? new Date(enrollment.courseStartingDate) : enrolledDate;
    const effectiveStartDate = startingDate > enrolledDate ? startingDate : enrolledDate;
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysElapsed > 20) {
      throw new BadRequestError(
        `Refund window expired. The 20-day refund policy ended ${daysElapsed - 20} day(s) ago.`
      );
    }

    // 3. Policy Check: Before 4 Live Classes Conducted or Attended
    const classesConductedCount = await defaultPrisma.courseLesson.count({
      where: {
        module: { courseId: enrollment.courseId },
        OR: [
          { liveStatus: "COMPLETED" },
          { scheduledAt: { lte: now } },
        ],
      },
    });

    const classesAttendedCount = enrollment.attendedClassesCount;

    if (classesConductedCount >= 4) {
      throw new BadRequestError(
        `Refund policy limit reached. 4 live class sessions have already been conducted for this course (${classesConductedCount} held).`
      );
    }

    if (classesAttendedCount >= 4) {
      throw new BadRequestError(
        `Refund policy limit reached. You have already attended 4 or more live classes (${classesAttendedCount} attended).`
      );
    }

    // 4. Check if Certificate was Claimed
    const certificate = await this.enrollmentRepo.findCertificateByEnrollmentId(enrollment.id);
    if (certificate) {
      throw new BadRequestError("Refunds cannot be issued after a course completion certificate has been claimed.");
    }

    let gatewayRefundId: string | undefined;
    let actualDestination = dto.destination;

    // 5. Process Refund to Student
    if (actualDestination === "ORIGINAL_PAYMENT_METHOD" && enrollment.razorpayPaymentId) {
      try {
        const gwRefund = await this.paymentGateway.refundPayment({
          paymentId: enrollment.razorpayPaymentId,
          amount: refundAmount,
          currency: enrollment.currency || "INR",
          notes: {
            enrollmentId: enrollment.id,
            reason: dto.reason,
            policy: "20-day or 4-classes full refund guarantee",
          },
        });
        gatewayRefundId = gwRefund.refundId;
      } catch (err: any) {
        console.warn("⚠️ Gateway refund failed, falling back to instant Wallet credit:", err);
        // Fallback to wallet credit if payment gateway refund fails
        actualDestination = "WALLET";
      }
    } else {
      actualDestination = "WALLET";
    }

    if (actualDestination === "WALLET") {
      let studentWallet = await defaultPrisma.wallet.findUnique({
        where: { userId: studentId },
      });
      if (!studentWallet) {
        studentWallet = await defaultPrisma.wallet.create({
          data: { userId: studentId, balance: 0 },
        });
      }
      const currentBal = Number(studentWallet.balance);
      const newBal = currentBal + refundAmount;

      await defaultPrisma.$transaction([
        defaultPrisma.wallet.update({
          where: { id: studentWallet.id },
          data: {
            balance: newBal,
            totalSpent: { decrement: Math.min(Number(studentWallet.totalSpent), refundAmount) },
          },
        }),
        defaultPrisma.walletTransaction.create({
          data: {
            walletId: studentWallet.id,
            type: "REFUND",
            direction: "CREDIT",
            amount: refundAmount,
            balanceBefore: currentBal,
            balanceAfter: newBal,
            description: `100% full refund for live course "${enrollment.courseTitle}" (within 20 days / 4 classes)`,
            referenceType: "ENROLLMENT",
            referenceId: enrollment.id,
          },
        }),
      ]);
    }

    // 6. Reverse Teacher Royalty Earning (85%)
    const course = await defaultPrisma.course.findUnique({
      where: { id: enrollment.courseId },
      include: { teacherProfile: { include: { profile: true } } },
    });
    const teacherUserId = course?.teacherProfile?.profile?.userId;

    if (teacherUserId) {
      const teacherRoyalty = Number((refundAmount * 0.85).toFixed(2));
      const teacherWallet = await defaultPrisma.wallet.findUnique({
        where: { userId: teacherUserId },
      });
      if (teacherWallet && teacherRoyalty > 0) {
        const teacherBal = Number(teacherWallet.balance);
        const newTeacherBal = Math.max(0, teacherBal - teacherRoyalty);
        await defaultPrisma.$transaction([
          defaultPrisma.wallet.update({
            where: { id: teacherWallet.id },
            data: {
              balance: newTeacherBal,
              totalEarned: { decrement: Math.min(Number(teacherWallet.totalEarned), teacherRoyalty) },
            },
          }),
          defaultPrisma.walletTransaction.create({
            data: {
              walletId: teacherWallet.id,
              type: "ADJUSTMENT",
              direction: "DEBIT",
              amount: teacherRoyalty,
              balanceBefore: teacherBal,
              balanceAfter: newTeacherBal,
              description: `Revenue reversal for refunded student enrollment in "${enrollment.courseTitle}"`,
              referenceType: "ENROLLMENT",
              referenceId: enrollment.id,
            },
          }),
        ]);
      }
    }

    // 7. Update Enrollment Status
    await this.enrollmentRepo.updateEnrollment(enrollment.id, {
      status: "REFUNDED",
    });

    // 8. Create Refund Audit Record
    const refundRecord = await this.enrollmentRepo.createRefund({
      enrollmentId: enrollment.id,
      studentId,
      amount: refundAmount,
      currency: enrollment.currency || "INR",
      reason: dto.reason,
      destination: actualDestination,
      gatewayRefundId,
      classesConductedAtRefund: classesConductedCount,
      classesAttendedAtRefund: classesAttendedCount,
      daysElapsedAtRefund: daysElapsed,
    });

    // 9. Send Refund Notification Email
    const student = await defaultPrisma.user.findUnique({ where: { id: studentId } });
    if (student?.email) {
      this.emailService
        .sendCustomEmail({
          to: student.email,
          subject: `Refund Processed: ${enrollment.courseTitle}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2>Refund Successfully Processed</h2>
              <p>Hi ${student.name},</p>
              <p>We have processed your 100% full refund of <strong>₹${refundAmount.toFixed(2)}</strong> for the course <strong>${enrollment.courseTitle}</strong> under our 20-Day / 4-Classes Guarantee.</p>
              <p><strong>Refund Destination:</strong> ${actualDestination === "WALLET" ? "Instant Coursity Wallet Credit" : "Original Payment Method (Razorpay)"}</p>
              <p><strong>Reason:</strong> ${dto.reason}</p>
              <p>Best regards,<br/>The Coursity Team</p>
            </div>
          `,
          text: `Refund Processed for ${enrollment.courseTitle}. Amount: ₹${refundAmount.toFixed(2)}. Destination: ${actualDestination}.`,
        })
        .catch((e) => console.warn("⚠️ Failed to dispatch refund confirmation email:", e));
    }

    return refundRecord;
  }
}
