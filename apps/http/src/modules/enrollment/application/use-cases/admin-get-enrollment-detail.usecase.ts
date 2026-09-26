import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { LessonProgressEntity } from "../../domain/entities/lesson-progress.entity";
import { CourseRefundEntity, CourseCertificateEntity } from "../../domain/entities/refund.entity";
import { NotFoundError } from "@/app/errors";

export interface AdminGetEnrollmentDetailOutput {
  enrollment: CourseEnrollmentEntity;
  lessonProgress: LessonProgressEntity[];
  refund: CourseRefundEntity | null;
  certificate: CourseCertificateEntity | null;
}

export class AdminGetEnrollmentDetailUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(enrollmentId: string): Promise<AdminGetEnrollmentDetailOutput> {
    const detail = await this.enrollmentRepo.findEnrollmentDetail(enrollmentId);
    if (!detail) {
      throw new NotFoundError("Enrollment not found.");
    }
    return detail;
  }
}
