import { ICategoryQueryRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity, CategoryTreeNode, CategoryFilterParams } from "../../domain/entities/category.entity";

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryQueryRepository) {}

  async execute(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }> {
    return this.categoryRepository.findMany({
      isActive: true,
      isDeleted: false,
      sortBy: "sortOrder",
      sortOrder: "asc",
      ...params,
    });
  }

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

export class GetCategoryTreeUseCase {
  constructor(private readonly categoryRepository: ICategoryQueryRepository) {}

  async execute(): Promise<CategoryTreeNode[]> {
    return this.categoryRepository.getCategoryTree(false, false);
  }
}

export class GetCategoryBySlugUseCase {
  constructor(private readonly categoryRepository: ICategoryQueryRepository) {}

  async execute(slug: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findBySlug(slug, false);
  }
}
