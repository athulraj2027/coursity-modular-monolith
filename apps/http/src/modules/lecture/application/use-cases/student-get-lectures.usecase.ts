import { ILectureRepository } from "../../domain/repositories/lecture.repository";
import { LectureFilterParams, PaginatedLecturesResult } from "../../domain/dtos/lecture.dto";
import { LectureEntity } from "../../domain/entities/lecture.entity";

export class StudentGetLecturesUseCase {
  constructor(private readonly lectureRepo: ILectureRepository) {}

  async execute(
    studentId: string,
    params: LectureFilterParams
  ): Promise<PaginatedLecturesResult<LectureEntity>> {
    return this.lectureRepo.findManyStudentLectures(studentId, params);
  }
}
