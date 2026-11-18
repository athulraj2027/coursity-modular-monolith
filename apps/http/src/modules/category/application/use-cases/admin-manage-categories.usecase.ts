import { ICategoryAdminRepository } from "../../domain/repositories/category.repository";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../../domain/entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../domain/dtos/category.dto";
import { AdminCreateCategoryUseCase } from "./admin-create-category.usecase";
import { AdminUpdateCategoryUseCase } from "./admin-update-category.usecase";
import { AdminToggleCategoryStatusUseCase } from "./admin-toggle-status.usecase";
import { AdminSoftDeleteCategoryUseCase } from "./admin-soft-delete-category.usecase";
import { AdminRestoreCategoryUseCase } from "./admin-restore-category.usecase";
import { AdminHardDeleteCategoryUseCase } from "./admin-hard-delete-category.usecase";
import { AdminGetAllCategoriesUseCase } from "./admin-get-all-categories.usecase";
import { AdminGetCategoryByIdUseCase } from "./admin-get-category-by-id.usecase";
import { AdminGetCategoryTreeUseCase } from "./admin-get-category-tree.usecase";
import { AdminGetMetricsUseCase } from "./admin-get-metrics.usecase";

/**
 * Facade coordinating individual administrative category use cases.
 * Provides backwards compatibility for monolithic consumers while delegating
 * each concern to its dedicated Single Responsibility Use Case.
 */
export class AdminManageCategoriesUseCase {
  private readonly createUseCase: AdminCreateCategoryUseCase;
  private readonly updateUseCase: AdminUpdateCategoryUseCase;
  private readonly toggleStatusUseCase: AdminToggleCategoryStatusUseCase;
  private readonly softDeleteUseCase: AdminSoftDeleteCategoryUseCase;
  private readonly restoreUseCase: AdminRestoreCategoryUseCase;
  private readonly hardDeleteUseCase: AdminHardDeleteCategoryUseCase;
  private readonly getAllUseCase: AdminGetAllCategoriesUseCase;
  private readonly getByIdUseCase: AdminGetCategoryByIdUseCase;
  private readonly getTreeUseCase: AdminGetCategoryTreeUseCase;
  private readonly getMetricsUseCase: AdminGetMetricsUseCase;

  constructor(categoryRepository: ICategoryAdminRepository) {
    this.createUseCase = new AdminCreateCategoryUseCase(categoryRepository);
    this.updateUseCase = new AdminUpdateCategoryUseCase(categoryRepository);
    this.toggleStatusUseCase = new AdminToggleCategoryStatusUseCase(categoryRepository);
    this.softDeleteUseCase = new AdminSoftDeleteCategoryUseCase(categoryRepository);
    this.restoreUseCase = new AdminRestoreCategoryUseCase(categoryRepository);
    this.hardDeleteUseCase = new AdminHardDeleteCategoryUseCase(categoryRepository);
    this.getAllUseCase = new AdminGetAllCategoriesUseCase(categoryRepository);
    this.getByIdUseCase = new AdminGetCategoryByIdUseCase(categoryRepository);
    this.getTreeUseCase = new AdminGetCategoryTreeUseCase(categoryRepository);
    this.getMetricsUseCase = new AdminGetMetricsUseCase(categoryRepository);
  }

  async getAllCategories(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }> {
    return this.getAllUseCase.execute(params);
  }

  async getCategoryTree(includeInactive = true, includeDeleted = false): Promise<CategoryTreeNode[]> {
    return this.getTreeUseCase.execute(includeInactive, includeDeleted);
  }

  async getCategoryById(id: string): Promise<CategoryEntity> {
    return this.getByIdUseCase.execute(id);
  }

  async getMetrics(): Promise<CategoryMetrics> {
    return this.getMetricsUseCase.execute();
  }

  async createCategory(dto: CreateCategoryDTO): Promise<CategoryEntity> {
    return this.createUseCase.execute(dto);
  }

  async updateCategory(id: string, dto: UpdateCategoryDTO): Promise<CategoryEntity> {
    return this.updateUseCase.execute(id, dto);
  }

  async toggleActive(id: string, isActive: boolean): Promise<CategoryEntity> {
    return this.toggleStatusUseCase.execute(id, isActive);
  }

  async softDeleteCategory(id: string): Promise<CategoryEntity> {
    return this.softDeleteUseCase.execute(id);
  }

  async restoreCategory(id: string): Promise<CategoryEntity> {
    return this.restoreUseCase.execute(id);
  }

  async hardDeleteCategory(id: string): Promise<boolean> {
    return this.hardDeleteUseCase.execute(id);
  }
}
