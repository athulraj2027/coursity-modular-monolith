import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseEnrollmentEntity } from "../../domain/entities/enrollment.entity";
import { LessonProgressEntity } from "../../domain/entities/lesson-progress.entity";
import { CourseRefundEntity, CourseCertificateEntity } from "../../domain/entities/refund.entity";
import { NotFoundError } from "@/app/errors";

export interface TeacherEnrollmentDetailOutput {
  enrollment: CourseEnrollmentEntity;
  lessonProgress: LessonProgressEntity[];
  refund: CourseRefundEntity | null;
  certificate: CourseCertificateEntity | null;
}

export class TeacherGetEnrollmentDetailUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(teacherUserId: string, enrollmentId: string): Promise<TeacherEnrollmentDetailOutput> {
    const detail = await this.enrollmentRepo.findEnrollmentDetail(enrollmentId, teacherUserId);
    if (!detail) {
      throw new NotFoundError("Enrollment record not found or you do not have permission to view this enrollment.");
    }
    return detail;
  }
}
