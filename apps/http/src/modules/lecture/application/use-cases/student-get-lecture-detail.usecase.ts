import {
  ILectureQueryRepository,
  IStudentLectureRepository,
} from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import {
  LectureAccessDeniedError,
  LectureNotFoundError,
} from "../../domain/errors/lecture.errors";

export type StudentGetLectureDetailRepository = ILectureQueryRepository & IStudentLectureRepository;

export class StudentGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: StudentGetLectureDetailRepository) {}

  async execute(studentId: string, lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture || lecture.isDeleted || !lecture.isPublished) {
      throw new LectureNotFoundError("Lecture not found or unavailable.");
    }

    // Verify student has active enrollment in parent course
    if (lecture.courseId) {
      const access = await this.lectureRepo.findStudentLessonAccess(
        studentId,
        lecture.courseId,
        lectureId
      );

      if (!access.hasActiveEnrollment) {
        throw new LectureAccessDeniedError("You must be actively enrolled in this course to access this lecture.");
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
