import { ILectureQueryRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import {
  LectureAccessDeniedError,
  LectureNotFoundError,
} from "../../domain/errors/lecture.errors";

export class TeacherGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: ILectureQueryRepository) {}

  async execute(teacherProfileId: string, lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new LectureNotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new LectureAccessDeniedError("You do not have permission to access this lecture.");
    }

    return lecture;
  }
}
