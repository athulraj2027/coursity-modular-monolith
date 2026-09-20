import {
  CategoryEntity,
  CategoryTreeNode,
  CategoryFilterParams,
  CategoryMetrics,
} from "../entities/category.entity";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";

export interface ICategoryRepository {
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
