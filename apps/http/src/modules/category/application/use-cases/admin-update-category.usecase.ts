import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import { CategoryEntity } from "../../domain/entities/category.entity";
import { UpdateCategoryDTO } from "../../domain/dtos/category.dto";
import { CategorySlugPolicy } from "../../domain/policies/category-slug.policy";
import { CategoryHierarchyPolicy } from "../../domain/policies/category-hierarchy.policy";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminUpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryAdminRepository) { }

  async execute(id: string, dto: UpdateCategoryDTO): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }

    // Slug validation and uniqueness
    let normalizedSlug = dto.slug ? CategorySlugPolicy.normalize(dto.slug) : undefined;
    if (normalizedSlug && normalizedSlug !== existing.slug) {
      const conflict = await this.categoryRepository.findBySlug(normalizedSlug, true);
      if (conflict && conflict.id !== id) {
        throw new BadRequestError(`A category with slug '${normalizedSlug}' already exists.`);
      }
    }

    // Hierarchy validation
    if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
      if (dto.parentId) {
        const parent = await this.categoryRepository.findById(dto.parentId, false);
        const childCount = await this.categoryRepository.countChildren(id, true);

        CategoryHierarchyPolicy.validateParentAssignment({
          currentId: id,
          parentId: dto.parentId,
          parent,
          currentChildCount: childCount,
        });
      }
    }

    return this.categoryRepository.update(id, {
      ...dto,
      slug: normalizedSlug ?? dto.slug,
    });
  }
}

