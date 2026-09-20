// Repositories
import { PrismaCategoryRepository } from "./infrastructure/repositories/prisma-category.repository";

// Use Cases
import { GetCategoriesUseCase } from "./application/use-cases/get-categories.usecase";
import { AdminManageCategoriesUseCase } from "./application/use-cases/admin-manage-categories.usecase";

// Controllers & Routes
import { CategoryController } from "./presentation/controllers/category.controller";
import { CategoryRoutes } from "./presentation/routes/category.routes";

// 1. Instantiate Repository
const categoryRepository = new PrismaCategoryRepository();

// 2. Instantiate Use Cases
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
const adminManageCategoriesUseCase = new AdminManageCategoriesUseCase(categoryRepository);

// 3. Instantiate Controller & Router
const categoryController = new CategoryController(
  getCategoriesUseCase,
  adminManageCategoriesUseCase
);

const categoryRoutes = new CategoryRoutes(categoryController);

// Exports
export * from "./domain/entities/category.entity";
export * from "./domain/dtos/category.dto";
export * from "./domain/repositories/category.repository";
export * from "./infrastructure/repositories/prisma-category.repository";
export * from "./application/use-cases/get-categories.usecase";
export * from "./application/use-cases/admin-manage-categories.usecase";
export * from "./presentation/controllers/category.controller";
export * from "./presentation/validators/category.validator";
export * from "./presentation/routes/category.routes";
export * from "./infrastructure/seed/default-categories.seed";

export const categoryRouter = categoryRoutes.router;
export default categoryRouter;
