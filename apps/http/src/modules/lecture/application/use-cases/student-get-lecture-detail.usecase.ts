import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { NotFoundError, ForbiddenError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class StudentGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(studentId: string, lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture || lecture.isDeleted || !lecture.isPublished) {
      throw new NotFoundError("Lecture not found or unavailable.");
    }

    // Verify student has active enrollment in parent course
    if (lecture.courseId) {
      const enrollment = await defaultPrisma.courseEnrollment.findFirst({
        where: {
          studentId,
          courseId: lecture.courseId,
          status: "ACTIVE",
        },
      });

      if (!enrollment) {
        throw new ForbiddenError("You must be actively enrolled in this course to access this lecture.");
      }

      // Fetch progress for this specific student & lecture
      const progress = await defaultPrisma.lessonProgress.findFirst({
        where: {
          enrollmentId: enrollment.id,
          lessonId: lectureId,
        },
      });

      return {
        ...lecture,
        attendedLive: progress?.attendedLive ?? false,
        isCompleted: progress?.isCompleted ?? false,
      };
    }

    return lecture;
  }
}
