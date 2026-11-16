import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { NotFoundError } from "@/app/errors";

export class AdminGetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id, true);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return category;
  }
}

