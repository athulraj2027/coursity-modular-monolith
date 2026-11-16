import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { NotFoundError } from "@/app/errors";

export class AdminHardDeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(id: string): Promise<boolean> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }

    return this.categoryRepository.hardDelete(id);
  }
}

