import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class TeacherDeleteLectureUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(teacherProfileId: string, lectureId: string): Promise<boolean> {
    const lecture = await this.lectureRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundError("Lecture not found.");
    }

    if (lecture.teacherId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to delete this lecture.");
    }

    return this.lectureRepo.softDeleteLecture(lectureId);
  }
}
