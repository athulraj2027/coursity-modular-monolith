import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureFilterParams, PaginatedLecturesResult } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";

export class TeacherGetLecturesUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(
    teacherProfileId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    return this.lectureRepo.findManyTeacherLectures(teacherProfileId, params);
  }
}
