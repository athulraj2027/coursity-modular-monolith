import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { CreateCategoryDTO } from "../../domain/dtos/category.dto";
import { CategorySlugPolicy } from "../../domain/policies/category-slug.policy";
import { CategoryHierarchyPolicy } from "../../domain/policies/category-hierarchy.policy";
import { BadRequestError } from "@/app/errors";

export class AdminCreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) {}

  async execute(dto: CreateCategoryDTO): Promise<CategoryEntity> {
    const slug = dto.slug ? CategorySlugPolicy.normalize(dto.slug) : CategorySlugPolicy.generate(dto.name);

    // Validate slug uniqueness
    const existing = await this.categoryRepository.findBySlug(slug, true);
    if (existing) {
      throw new BadRequestError(`A category with slug '${slug}' already exists.`);
    }

    // Validate hierarchy rules if parentId is provided
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId, false);
      CategoryHierarchyPolicy.validateParentAssignment({
        parentId: dto.parentId,
        parent,
      });
    }

    return this.categoryRepository.create({
      ...dto,
      slug,
    });
  }
}

