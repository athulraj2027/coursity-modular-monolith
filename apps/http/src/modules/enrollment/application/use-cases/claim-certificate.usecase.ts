import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseCertificateEntity } from "../../domain/entities/refund.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ClaimCertificateUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, enrollmentId: string): Promise<CourseCertificateEntity> {
    const enrollment = await this.enrollmentRepo.findEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment not found.");
    }

    if (enrollment.studentId !== studentId) {
      throw new BadRequestError("You do not own this enrollment.");
    }

    if (enrollment.status === "REFUNDED") {
      throw new BadRequestError("Cannot claim a certificate for a refunded enrollment.");
    }

    // Check if already claimed
    const existing = await this.enrollmentRepo.findCertificateByEnrollmentId(enrollmentId);
    if (existing) {
      return existing;
    }

    // Check completion requirements (at least 90% progress or attended >= 80% classes)
    if (enrollment.progressPercentage < 90 && enrollment.completedLessonsCount < (enrollment.totalLessons || 1)) {
      throw new BadRequestError(
        `Course progress is currently at ${enrollment.progressPercentage}%. You must complete at least 90% of the syllabus to claim your certificate.`
      );
    }

    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certificateCode = `CRT-${year}-${randomHex}`;

    const student = await defaultPrisma.user.findUnique({ where: { id: studentId } });

    return this.enrollmentRepo.createCertificate({
      enrollmentId,
      certificateCode,
      studentName: student?.name || enrollment.studentName || "Student",
      courseTitle: enrollment.courseTitle || "Live Course",
      instructorName: enrollment.instructorName || "Instructor",
    });
  }
}
