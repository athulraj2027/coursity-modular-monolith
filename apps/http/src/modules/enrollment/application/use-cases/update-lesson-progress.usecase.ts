import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { UpdateLessonProgressDto } from "../../domain/dtos/enrollment.dto";
import { LessonProgressEntity } from "../../domain/entities/lesson-progress.entity";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class UpdateLessonProgressUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, dto: UpdateLessonProgressDto): Promise<LessonProgressEntity> {
    const enrollment = await this.enrollmentRepo.findEnrollmentById(dto.enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment not found.");
    }

    if (enrollment.studentId !== studentId) {
      throw new BadRequestError("You do not own this enrollment.");
    }

    if (enrollment.status !== "ACTIVE") {
      throw new BadRequestError("Enrollment is no longer active.");
    }

    const progress = await this.enrollmentRepo.upsertLessonProgress({
      enrollmentId: dto.enrollmentId,
      lessonId: dto.lessonId,
      isCompleted: dto.isCompleted,
      lastPositionSeconds: dto.lastPositionSeconds,
    });

    // Count total and completed lessons to recalculate percentage
    const totalLessons = await this.enrollmentRepo.countTotalCourseLessons(enrollment.courseId);

    const completedLessonsCount = await this.enrollmentRepo.countCompletedLessons(dto.enrollmentId);

    const progressPercentage = totalLessons > 0 ? Number(((completedLessonsCount / totalLessons) * 100).toFixed(1)) : 0;
    const isNowCompleted = progressPercentage >= 100;

    await this.enrollmentRepo.updateEnrollment(dto.enrollmentId, {
      progressPercentage,
      completedLessonsCount,
      lastAccessedLessonId: dto.lessonId,
      status: isNowCompleted ? "COMPLETED" : "ACTIVE",
      completedAt: isNowCompleted ? new Date() : null,
    });

    return progress;
  }
}
