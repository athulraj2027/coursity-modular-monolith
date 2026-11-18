import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { NotFoundError } from "@/app/errors";

export class AdminSoftDeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(id: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }

    return this.categoryRepository.softDelete(id);
  }
}

