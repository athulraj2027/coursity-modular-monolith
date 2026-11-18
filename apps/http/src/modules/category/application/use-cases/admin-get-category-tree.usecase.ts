import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryTreeNode } from "../../domain/entities/category.entity";

export class AdminGetCategoryTreeUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(includeInactive = true, includeDeleted = false): Promise<CategoryTreeNode[]> {
    return this.categoryRepository.getCategoryTree(includeInactive, includeDeleted);
  }
}

