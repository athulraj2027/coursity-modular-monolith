import { IAdminHomeworkRepository } from "../../domain/repositories/homework.repository";
import { HomeworkFilterParams, PaginatedResult } from "../../domain/dtos/homework.dto";
import { HomeworkEntity } from "../../domain/entities/homework.entity";

export class AdminListHomeworkUseCase {
  constructor(private readonly homeworkRepo: IAdminHomeworkRepository) {}

  async execute(params: HomeworkFilterParams): Promise<PaginatedResult<HomeworkEntity>> {
    return this.homeworkRepo.findManyAdmin(params);
  }
}
