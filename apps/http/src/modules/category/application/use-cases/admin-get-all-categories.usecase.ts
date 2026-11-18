import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity, CategoryFilterParams } from "../../domain/entities/category.entity";

export class AdminGetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }> {
    return this.categoryRepository.findMany(params);
  }
}

