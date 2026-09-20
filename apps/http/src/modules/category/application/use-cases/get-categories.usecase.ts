import { ICategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity, CategoryTreeNode } from "../../domain/entities/category.entity";

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getActiveTree(): Promise<CategoryTreeNode[]> {
    return this.categoryRepository.getCategoryTree(false, false);
  }

  async getAllActive(): Promise<CategoryEntity[]> {
    const { items } = await this.categoryRepository.findMany({
      isActive: true,
      isDeleted: false,
      sortBy: "sortOrder",
      sortOrder: "asc",
    });
    return items;
  }

  async getBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findBySlug(slug, false);
  }

  async getById(id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findById(id, false);
  }
}
