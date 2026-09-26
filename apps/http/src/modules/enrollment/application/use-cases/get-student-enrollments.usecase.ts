import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity, EnrollmentStatus } from "../../domain/entities/enrollment.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class GetStudentEnrollmentsUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, status?: EnrollmentStatus): Promise<(CourseEnrollmentEntity & {
    isRefundEligible: boolean;
    daysRemainingForRefund: number;
    classesConductedCount: number;
  })[]> {
    const enrollments = await this.enrollmentRepo.listStudentEnrollments(studentId, status);
    const now = new Date();

    const enhanced = await Promise.all(
      enrollments.map(async (enr) => {
        // Count conducted live classes for this course (completed lessons or scheduled in the past)
        const classesConductedCount = await defaultPrisma.courseLesson.count({
          where: {
            module: { courseId: enr.courseId },
            OR: [
              { liveStatus: "COMPLETED" },
              { scheduledAt: { lte: now } },
            ],
          },
        });

        const refundDeadline = new Date(enr.refundEligibleUntil).getTime();
        const daysRemaining = Math.max(0, Math.ceil((refundDeadline - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        // 20 days refund policy AND before 4 classes conducted/attended
        const isWithinTimeWindow = now.getTime() <= refundDeadline;
        const isWithinClassCount = classesConductedCount < 4 && enr.attendedClassesCount < 4;
        const isPaid = enr.finalAmount > 0;
        const isRefundEligible = enr.status === "ACTIVE" && isPaid && isWithinTimeWindow && isWithinClassCount;

        return {
          ...enr,
          isRefundEligible,
          daysRemainingForRefund: daysRemaining,
          classesConductedCount,
        };
      })
    );

    return enhanced;
  }
}
