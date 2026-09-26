import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureEntity } from "../../domain/entities/lecture.entity";
import { NotFoundError } from "@/app/errors";

export class AdminGetLectureDetailUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(lectureId: string): Promise<LectureEntity> {
    const lecture = await this.lectureRepo.findById(lectureId, true);
    if (!lecture) {
      throw new NotFoundError("Lecture not found.");
    }
    return lecture;
  }
}
