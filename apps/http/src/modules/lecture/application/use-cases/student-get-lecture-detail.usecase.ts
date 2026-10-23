import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { NotFoundError, ForbiddenError } from "@/app/errors";

export class StudentGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(studentId: string, lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture || lecture.isDeleted || !lecture.isPublished) {
      throw new NotFoundError("Lecture not found or unavailable.");
    }

    // Verify student has active enrollment in parent course
    if (lecture.courseId) {
      const access = await this.lectureRepo.findStudentLessonAccess(
        studentId,
        lecture.courseId,
        lectureId
      );

      if (!access.hasActiveEnrollment) {
        throw new ForbiddenError("You must be actively enrolled in this course to access this lecture.");
      }

      return {
        ...lecture,
        attendedLive: access.attendedLive,
        isCompleted: access.isCompleted,
      };
    }

    return lecture;
  }
}
