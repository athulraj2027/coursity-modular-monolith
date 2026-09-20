import { ICategoryRepository } from "../../domain/repositories/category.repository";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../../domain/entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../domain/dtos/category.dto";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminManageCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getAllCategories(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }> {
    return this.categoryRepository.findMany(params);
  }

  async getCategoryTree(includeInactive = true, includeDeleted = false): Promise<CategoryTreeNode[]> {
    return this.categoryRepository.getCategoryTree(includeInactive, includeDeleted);
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findById(id, true);
    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return category;
  }

  async getMetrics(): Promise<CategoryMetrics> {
    return this.categoryRepository.getMetrics();
  }

  async createCategory(dto: CreateCategoryDTO): Promise<CategoryEntity> {
    // Validate slug uniqueness if provided
    if (dto.slug) {
      const existing = await this.categoryRepository.findBySlug(dto.slug, true);
      if (existing) {
        throw new BadRequestError(`A category with slug '${dto.slug}' already exists.`);
      }
    }

    // If parentId provided, verify parent exists and is not a subcategory itself (limit to 2 levels)
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId, false);
      if (!parent) {
        throw new BadRequestError(`Parent category with ID '${dto.parentId}' does not exist or is deleted.`);
      }
      if (parent.parentId) {
        throw new BadRequestError("Nesting beyond 2 levels (subcategories under subcategories) is not permitted.");
      }
    }

    return this.categoryRepository.create(dto);
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }

    // If slug is changed, check for uniqueness
    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.categoryRepository.findBySlug(dto.slug, true);
      if (conflict && conflict.id !== id) {
        throw new BadRequestError(`A category with slug '${dto.slug}' already exists.`);
      }
    }

    // If parentId changed, prevent setting self as parent or creating cyclic loop
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestError("A category cannot be its own parent.");
      }
      const parent = await this.categoryRepository.findById(dto.parentId, false);
      if (!parent) {
        throw new BadRequestError(`Parent category with ID '${dto.parentId}' does not exist or is deleted.`);
      }
      if (parent.parentId) {
        throw new BadRequestError("Nesting beyond 2 levels is not permitted.");
      }
      // If this category currently has children, it cannot become a child of another category
      const childCount = await this.categoryRepository.countChildren(id, true);
      if (childCount > 0) {
        throw new BadRequestError(
          "This category has existing subcategories and cannot be demoted to a child category."
        );
      }
    }

    return this.categoryRepository.update(id, dto);
  }

  async toggleActive(id: string, isActive: boolean): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return this.categoryRepository.toggleActive(id, isActive);
  }

  async softDeleteCategory(id: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return this.categoryRepository.softDelete(id);
  }

  async restoreCategory(id: string): Promise<CategoryEntity> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return this.categoryRepository.restore(id);
  }

  async hardDeleteCategory(id: string): Promise<boolean> {
    const existing = await this.categoryRepository.findById(id, true);
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' was not found.`);
    }
    return this.categoryRepository.hardDelete(id);
  }
}
