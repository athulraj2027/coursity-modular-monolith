import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryMetrics } from "../../domain/entities/category.entity";

export class AdminGetMetricsUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(): Promise<CategoryMetrics> {
    return this.categoryRepository.getMetrics();
  }
}

