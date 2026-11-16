import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";

// Repositories
import { PrismaCategoryRepository } from "./infrastructure/repositories/prisma-category.repository";

// Use Cases
import {
  GetCategoriesUseCase,
  GetCategoryTreeUseCase,
  GetCategoryBySlugUseCase,
} from "./application/use-cases/get-categories.usecase";
import { AdminCreateCategoryUseCase } from "./application/use-cases/admin-create-category.usecase";
import { AdminUpdateCategoryUseCase } from "./application/use-cases/admin-update-category.usecase";
import { AdminToggleCategoryStatusUseCase } from "./application/use-cases/admin-toggle-status.usecase";
import { AdminSoftDeleteCategoryUseCase } from "./application/use-cases/admin-soft-delete-category.usecase";
import { AdminRestoreCategoryUseCase } from "./application/use-cases/admin-restore-category.usecase";
import { AdminHardDeleteCategoryUseCase } from "./application/use-cases/admin-hard-delete-category.usecase";
import { AdminGetAllCategoriesUseCase } from "./application/use-cases/admin-get-all-categories.usecase";
import { AdminGetCategoryByIdUseCase } from "./application/use-cases/admin-get-category-by-id.usecase";
import { AdminGetCategoryTreeUseCase } from "./application/use-cases/admin-get-category-tree.usecase";
import { AdminGetMetricsUseCase } from "./application/use-cases/admin-get-metrics.usecase";
import { AdminManageCategoriesUseCase } from "./application/use-cases/admin-manage-categories.usecase";

// Controllers & Routes
import { CategoryController } from "./presentation/controllers/category.controller";
import { createCategoryRouter, CategoryRoutes } from "./presentation/routes/category.routes";

export function createCategoryModule(prisma: PrismaClient = defaultPrisma) {
  const categoryRepository = new PrismaCategoryRepository(prisma);

  // Query Use Cases
  const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
  const getCategoryTreeUseCase = new GetCategoryTreeUseCase(categoryRepository);
  const getCategoryBySlugUseCase = new GetCategoryBySlugUseCase(categoryRepository);

  // Admin Command & Query Use Cases
  const adminCreateCategoryUseCase = new AdminCreateCategoryUseCase(categoryRepository);
  const adminUpdateCategoryUseCase = new AdminUpdateCategoryUseCase(categoryRepository);
  const adminToggleStatusUseCase = new AdminToggleCategoryStatusUseCase(categoryRepository);
  const adminSoftDeleteUseCase = new AdminSoftDeleteCategoryUseCase(categoryRepository);
  const adminRestoreUseCase = new AdminRestoreCategoryUseCase(categoryRepository);
  const adminHardDeleteUseCase = new AdminHardDeleteCategoryUseCase(categoryRepository);
  const adminGetAllCategoriesUseCase = new AdminGetAllCategoriesUseCase(categoryRepository);
  const adminGetCategoryByIdUseCase = new AdminGetCategoryByIdUseCase(categoryRepository);
  const adminGetCategoryTreeUseCase = new AdminGetCategoryTreeUseCase(categoryRepository);
  const adminGetMetricsUseCase = new AdminGetMetricsUseCase(categoryRepository);

  // Facade for backward compatibility
  const adminManageCategoriesUseCase = new AdminManageCategoriesUseCase(categoryRepository);

  const categoryController = new CategoryController({
    getCategoriesUseCase,
    getCategoryTreeUseCase,
    getCategoryBySlugUseCase,
    adminManageCategoriesUseCase,
    adminCreateCategoryUseCase,
    adminUpdateCategoryUseCase,
    adminToggleStatusUseCase,
    adminSoftDeleteUseCase,
    adminRestoreUseCase,
    adminHardDeleteUseCase,
    adminGetAllCategoriesUseCase,
    adminGetCategoryByIdUseCase,
    adminGetCategoryTreeUseCase,
    adminGetMetricsUseCase,
  });

  const categoryRouter = createCategoryRouter(categoryController);
  const categoryRoutes = new CategoryRoutes(categoryController);

  return {
    categoryRepository,
    useCases: {
      getCategoriesUseCase,
      getCategoryTreeUseCase,
      getCategoryBySlugUseCase,
      adminCreateCategoryUseCase,
      adminUpdateCategoryUseCase,
      adminToggleStatusUseCase,
      adminSoftDeleteUseCase,
      adminRestoreUseCase,
      adminHardDeleteUseCase,
      adminGetAllCategoriesUseCase,
      adminGetCategoryByIdUseCase,
      adminGetCategoryTreeUseCase,
      adminGetMetricsUseCase,
      adminManageCategoriesUseCase,
    },
    categoryController,
    categoryRouter,
    categoryRoutes,
  };
}

const defaultModule = createCategoryModule();
export const categoryRepository = defaultModule.categoryRepository;
export const getCategoriesUseCase = defaultModule.useCases.getCategoriesUseCase;
export const adminManageCategoriesUseCase = defaultModule.useCases.adminManageCategoriesUseCase;
export const categoryController = defaultModule.categoryController;
export const categoryRoutes = defaultModule.categoryRoutes;
export const categoryRouter: Router = defaultModule.categoryRouter;
export default categoryRouter;

// Re-export Domain layer
export * from "./domain/entities/category.entity";
export * from "./domain/dtos/category.dto";
export * from "./domain/repositories/category.repository";
export * from "./domain/policies/category-slug.policy";
export * from "./domain/policies/category-hierarchy.policy";

// Re-export Application layer (Use Cases)
export * from "./application/use-cases/get-categories.usecase";
export * from "./application/use-cases/admin-create-category.usecase";
export * from "./application/use-cases/admin-update-category.usecase";
export * from "./application/use-cases/admin-toggle-status.usecase";
export * from "./application/use-cases/admin-soft-delete-category.usecase";
export * from "./application/use-cases/admin-restore-category.usecase";
export * from "./application/use-cases/admin-hard-delete-category.usecase";
export * from "./application/use-cases/admin-get-all-categories.usecase";
export * from "./application/use-cases/admin-get-category-by-id.usecase";
export * from "./application/use-cases/admin-get-category-tree.usecase";
export * from "./application/use-cases/admin-get-metrics.usecase";
export * from "./application/use-cases/admin-manage-categories.usecase";

// Re-export Infrastructure & Presentation layers
export * from "./infrastructure/repositories/prisma-category.repository";
export * from "./presentation/controllers";
export * from "./presentation/validators/category.validator";
export * from "./presentation/routes/category.routes";
export * from "./infrastructure/seed/default-categories.seed";
