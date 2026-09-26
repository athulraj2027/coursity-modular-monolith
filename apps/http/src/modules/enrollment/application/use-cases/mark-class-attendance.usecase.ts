import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { MarkClassAttendanceDto } from "../../domain/dtos/enrollment.dto";
import { LessonProgressEntity } from "../../domain/entities/lesson-progress.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class MarkClassAttendanceUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(studentId: string, dto: MarkClassAttendanceDto): Promise<LessonProgressEntity> {
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

    const lesson = await defaultPrisma.courseLesson.findUnique({
      where: { id: dto.lessonId },
    });
    if (!lesson) {
      throw new NotFoundError("Class session not found.");
    }

    const progress = await this.enrollmentRepo.upsertLessonProgress({
      enrollmentId: dto.enrollmentId,
      lessonId: dto.lessonId,
      attendedLive: true,
      liveAttendanceMinutes: dto.liveAttendanceMinutes || 30,
      isCompleted: true,
    });

    // Recalculate attended classes count
    const attendedCount = await defaultPrisma.lessonProgress.count({
      where: {
        enrollmentId: dto.enrollmentId,
        attendedLive: true,
      },
    });

    await this.enrollmentRepo.updateEnrollment(dto.enrollmentId, {
      attendedClassesCount: attendedCount,
      lastAccessedLessonId: dto.lessonId,
    });

    return progress;
  }
}
