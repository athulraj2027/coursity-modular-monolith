import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { NotFoundError } from "@/app/errors";

export class AdminToggleCategoryStatusUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(id: string, isActive: boolean): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }

    return this.categoryRepository.toggleActive(id, isActive);
  }
}

