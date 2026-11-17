import { ICourseRefundRepository, IStudentEnrollmentRepository, ILessonProgressRepository, ICourseCertificateRepository } from "../../domain/repositories/enrollment.repository";
import { RequestCourseRefundDto } from "../../domain/dtos/enrollment.dto";
import { CourseRefundEntity } from "../../domain/entities/refund.entity";
import { CourseRefundPolicy } from "../../domain/policies/course-refund.policy";
import { TeacherRoyaltyPolicy } from "../../domain/policies/teacher-royalty.policy";
import { ICourseRepository } from "@/modules/course/domain/repositories/course.repository";
import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IWalletRepository } from "@/modules/wallet/domain/repositories/wallet.repository.interface";
import { IPaymentRefundGateway } from "@/shared/application/ports/payment.port";
import { ICustomEmailNotifier } from "@/shared/application/ports/email.port";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class RequestCourseRefundUseCase {
  constructor(
    private readonly enrollmentRepo: IStudentEnrollmentRepository & ILessonProgressRepository & ICourseRefundRepository & ICourseCertificateRepository,
    private readonly courseRepo: ICourseRepository,
    private readonly userRepo: UserRepository,
    private readonly walletRepo: IWalletRepository,
    private readonly paymentGateway: IPaymentRefundGateway,
    private readonly emailService: ICustomEmailNotifier
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

    // 2. Query Policy Parameters (Conducted Classes, Attended Classes, Certificate)
    const classesConductedCount = await this.enrollmentRepo.countConductedClasses(enrollment.courseId);
    const classesAttendedCount = enrollment.attendedClassesCount;
    const certificate = await this.enrollmentRepo.findCertificateByEnrollmentId(enrollment.id);

    // 3. Evaluate 20-Day / 4-Classes Full Refund Guarantee via Domain Policy
    const eligibility = CourseRefundPolicy.checkEligibility({
      enrollment,
      classesConductedCount,
      classesAttendedCount,
      hasClaimedCertificate: Boolean(certificate),
    });

    if (!eligibility.isEligible) {
      throw new BadRequestError(eligibility.reasonIfNotEligible || "Refund eligibility check failed.");
    }

    const refundAmount = enrollment.finalAmount;
    let gatewayRefundId: string | undefined;
    let actualDestination = dto.destination;

    // 4. Process Refund to Student
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
        // Fallback to wallet credit if payment gateway refund fails
        actualDestination = "WALLET";
      }
    } else {
      actualDestination = "WALLET";
    }

    if (actualDestination === "WALLET") {
      await this.walletRepo.credit({
        userId: studentId,
        amount: refundAmount,
        type: "REFUND",
        description: `100% full refund for live course "${enrollment.courseTitle}" (within 20 days / 4 classes)`,
        referenceType: "ENROLLMENT",
        referenceId: enrollment.id,
      });
    }

    // 5. Reverse Teacher Royalty Earning using TeacherRoyaltyPolicy
    const course = await this.courseRepo.findById(enrollment.courseId);
    const teacherUserId = course?.teacherProfile?.profile?.userId || course?.teacherProfile?.profile?.user?.id;

    if (teacherUserId) {
      const teacherRoyalty = TeacherRoyaltyPolicy.calculateRoyalty(refundAmount);
      if (teacherRoyalty > 0) {
        const teacherWallet = await this.walletRepo.findByUserId(teacherUserId);
        if (teacherWallet && Number(teacherWallet.balance) >= teacherRoyalty) {
          await this.walletRepo.debit({
            userId: teacherUserId,
            amount: teacherRoyalty,
            type: "ADJUSTMENT",
            description: `Revenue reversal for refunded student enrollment in "${enrollment.courseTitle}"`,
            referenceType: "ENROLLMENT",
            referenceId: enrollment.id,
          });
        }
      }
    }

    // 6. Update Enrollment Status
    await this.enrollmentRepo.updateEnrollment(enrollment.id, {
      status: "REFUNDED",
    });

    // 7. Create Refund Audit Record
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
      daysElapsedAtRefund: eligibility.daysElapsed,
    });

    // 8. Send Refund Notification Email
    const student = await this.userRepo.findById(studentId);
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
        .catch(() => {});
    }

    return refundRecord;
  }
}
