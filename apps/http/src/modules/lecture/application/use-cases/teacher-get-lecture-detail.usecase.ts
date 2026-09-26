import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { NotFoundError, ForbiddenError } from "@/app/errors";

export class TeacherGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(teacherProfileId: string, lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to access this lecture.");
    }

    return lecture;
  }
}
