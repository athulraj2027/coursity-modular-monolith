import { IHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkFilterParams, PaginatedResult } from "../../domain/dtos/homework.dto";
import { HomeworkEntity } from "../../domain/entities/homework.entity";

export class AdminListHomeworkUseCase {
  constructor(private readonly homeworkRepo: IHomeworkRepository) {}

  async execute(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>> {
    return this.homeworkRepo.findManyAdmin(params);
  }
}
