import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";

/**
 * Interface Segregation: Read-only query operations (public catalog, search, navigation)
 */
export interface ICategoryQueryRepository {
  findById(id: string, includeDeleted?: boolean): Promise<CategoryEntity | null>;
  findBySlug(slug: string, includeDeleted?: boolean): Promise<CategoryEntity | null>;
  findMany(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }>;
  getCategoryTree(includeInactive?: boolean, includeDeleted?: boolean): Promise<CategoryTreeNode[]>;
}

/**
 * Interface Segregation: Administrative operations (mutations, deletion, metrics, hierarchy)
 */
export interface ICategoryAdminRepository {
  findById(id: string, includeDeleted?: boolean): Promise<CategoryEntity | null>;
  findBySlug(slug: string, includeDeleted?: boolean): Promise<CategoryEntity | null>;
  findMany(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }>;
  getCategoryTree(includeInactive?: boolean, includeDeleted?: boolean): Promise<CategoryTreeNode[]>;
  getMetrics(): Promise<CategoryMetrics>;
  create(data: CreateCategoryDTO): Promise<CategoryEntity>;
  update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity>;
  toggleActive(id: string, isActive: boolean): Promise<CategoryEntity>;
  softDelete(id: string): Promise<CategoryEntity>;
  restore(id: string): Promise<CategoryEntity>;
  hardDelete(id: string): Promise<boolean>;
  countChildren(parentId: string, includeDeleted?: boolean): Promise<number>;
}

/**
 * Unified Category Repository interface conforming to Clean Architecture and Base Repository
 */
export interface ICategoryRepository
  extends ICategoryQueryRepository,
    ICategoryAdminRepository,
    IBaseRepository<
      CategoryEntity,
      string,
      CreateCategoryDTO,
      UpdateCategoryDTO,
      CategoryFilterParams
    > {
  findById(id: string, includeDeleted?: boolean): Promise<CategoryEntity | null>;
  findMany(params?: CategoryFilterParams): Promise<{ items: CategoryEntity[]; total: number }>;
  create(data: CreateCategoryDTO): Promise<CategoryEntity>;
  update(id: string, data: UpdateCategoryDTO): Promise<CategoryEntity>;
  delete(id: string): Promise<boolean>;
}
