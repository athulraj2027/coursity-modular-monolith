import { Request, Response, NextFunction } from "express";
import {
  GetCategoriesUseCase,
  GetCategoryTreeUseCase,
  GetCategoryBySlugUseCase,
} from "../../application/use-cases/get-categories.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { AdminCreateCategoryUseCase } from "../../application/use-cases/admin-create-category.usecase";
import { AdminUpdateCategoryUseCase } from "../../application/use-cases/admin-update-category.usecase";
import { AdminToggleCategoryStatusUseCase } from "../../application/use-cases/admin-toggle-status.usecase";
import { AdminSoftDeleteCategoryUseCase } from "../../application/use-cases/admin-soft-delete-category.usecase";
import { AdminRestoreCategoryUseCase } from "../../application/use-cases/admin-restore-category.usecase";
import { AdminHardDeleteCategoryUseCase } from "../../application/use-cases/admin-hard-delete-category.usecase";
import { AdminGetAllCategoriesUseCase } from "../../application/use-cases/admin-get-all-categories.usecase";
import { AdminGetCategoryByIdUseCase } from "../../application/use-cases/admin-get-category-by-id.usecase";
import { AdminGetCategoryTreeUseCase } from "../../application/use-cases/admin-get-category-tree.usecase";
import { AdminGetMetricsUseCase } from "../../application/use-cases/admin-get-metrics.usecase";

import { GetCategoriesController } from "./get-categories.controller";
import { GetCategoryTreeController } from "./get-category-tree.controller";
import { GetCategoryBySlugController } from "./get-category-by-slug.controller";
import { AdminGetAllCategoriesController } from "./admin-get-all-categories.controller";
import { AdminGetCategoryTreeController } from "./admin-get-category-tree.controller";
import { AdminGetMetricsController } from "./admin-get-metrics.controller";
import { AdminGetCategoryByIdController } from "./admin-get-category-by-id.controller";
import { AdminCreateCategoryController } from "./admin-create-category.controller";
import { AdminUpdateCategoryController } from "./admin-update-category.controller";
import { AdminToggleStatusController } from "./admin-toggle-status.controller";
import { AdminSoftDeleteCategoryController } from "./admin-soft-delete-category.controller";
import { AdminRestoreCategoryController } from "./admin-restore-category.controller";
import { AdminHardDeleteCategoryController } from "./admin-hard-delete-category.controller";

export interface CategoryControllerDependencies {
  // Option A: Pre-instantiated controllers
  getCategoriesController?: GetCategoriesController;
  getCategoryTreeController?: GetCategoryTreeController;
  getCategoryBySlugController?: GetCategoryBySlugController;
  adminGetAllCategoriesController?: AdminGetAllCategoriesController;
  adminGetCategoryTreeController?: AdminGetCategoryTreeController;
  adminGetMetricsController?: AdminGetMetricsController;
  adminGetCategoryByIdController?: AdminGetCategoryByIdController;
  adminCreateCategoryController?: AdminCreateCategoryController;
  adminUpdateCategoryController?: AdminUpdateCategoryController;
  adminToggleStatusController?: AdminToggleStatusController;
  adminSoftDeleteCategoryController?: AdminSoftDeleteCategoryController;
  adminRestoreCategoryController?: AdminRestoreCategoryController;
  adminHardDeleteCategoryController?: AdminHardDeleteCategoryController;

  // Option B: Injected Use Cases
  getCategoriesUseCase?: GetCategoriesUseCase;
  getCategoryTreeUseCase?: GetCategoryTreeUseCase;
  getCategoryBySlugUseCase?: GetCategoryBySlugUseCase;
  adminManageCategoriesUseCase?: AdminManageCategoriesUseCase;
  adminCreateCategoryUseCase?: AdminCreateCategoryUseCase;
  adminUpdateCategoryUseCase?: AdminUpdateCategoryUseCase;
  adminToggleStatusUseCase?: AdminToggleCategoryStatusUseCase;
  adminSoftDeleteUseCase?: AdminSoftDeleteCategoryUseCase;
  adminRestoreUseCase?: AdminRestoreCategoryUseCase;
  adminHardDeleteUseCase?: AdminHardDeleteCategoryUseCase;
  adminGetAllCategoriesUseCase?: AdminGetAllCategoriesUseCase;
  adminGetCategoryByIdUseCase?: AdminGetCategoryByIdUseCase;
  adminGetCategoryTreeUseCase?: AdminGetCategoryTreeUseCase;
  adminGetMetricsUseCase?: AdminGetMetricsUseCase;
}

export class CategoryController {
  private readonly getCategoriesController: GetCategoriesController;
  private readonly getCategoryTreeController: GetCategoryTreeController;
  private readonly getCategoryBySlugController: GetCategoryBySlugController;
  private readonly adminGetAllCategoriesController: AdminGetAllCategoriesController;
  private readonly adminGetCategoryTreeController: AdminGetCategoryTreeController;
  private readonly adminGetMetricsController: AdminGetMetricsController;
  private readonly adminGetCategoryByIdController: AdminGetCategoryByIdController;
  private readonly adminCreateCategoryController: AdminCreateCategoryController;
  private readonly adminUpdateCategoryController: AdminUpdateCategoryController;
  private readonly adminToggleStatusController: AdminToggleStatusController;
  private readonly adminSoftDeleteCategoryController: AdminSoftDeleteCategoryController;
  private readonly adminRestoreCategoryController: AdminRestoreCategoryController;
  private readonly adminHardDeleteCategoryController: AdminHardDeleteCategoryController;

  constructor(
    getOrDeps: GetCategoriesUseCase | CategoryControllerDependencies,
    adminManageCategoriesUseCase?: AdminManageCategoriesUseCase
  ) {
    if (getOrDeps && typeof getOrDeps === "object" && !("getActiveTree" in getOrDeps)) {
      const deps = getOrDeps as CategoryControllerDependencies;
      const getUc = deps.getCategoriesUseCase;
      const adminUc = deps.adminManageCategoriesUseCase;

      this.getCategoriesController =
        deps.getCategoriesController ??
        new GetCategoriesController(getUc!);
      this.getCategoryTreeController =
        deps.getCategoryTreeController ??
        new GetCategoryTreeController(getUc!);
      this.getCategoryBySlugController =
        deps.getCategoryBySlugController ??
        new GetCategoryBySlugController(getUc!);

      this.adminGetAllCategoriesController =
        deps.adminGetAllCategoriesController ??
        new AdminGetAllCategoriesController(deps.adminGetAllCategoriesUseCase ?? adminUc!);
      this.adminGetCategoryTreeController =
        deps.adminGetCategoryTreeController ??
        new AdminGetCategoryTreeController(deps.adminGetCategoryTreeUseCase ?? adminUc!);
      this.adminGetMetricsController =
        deps.adminGetMetricsController ??
        new AdminGetMetricsController(deps.adminGetMetricsUseCase ?? adminUc!);
      this.adminGetCategoryByIdController =
        deps.adminGetCategoryByIdController ??
        new AdminGetCategoryByIdController(deps.adminGetCategoryByIdUseCase ?? adminUc!);
      this.adminCreateCategoryController =
        deps.adminCreateCategoryController ??
        new AdminCreateCategoryController(deps.adminCreateCategoryUseCase ?? adminUc!);
      this.adminUpdateCategoryController =
        deps.adminUpdateCategoryController ??
        new AdminUpdateCategoryController(deps.adminUpdateCategoryUseCase ?? adminUc!);
      this.adminToggleStatusController =
        deps.adminToggleStatusController ??
        new AdminToggleStatusController(deps.adminToggleStatusUseCase ?? adminUc!);
      this.adminSoftDeleteCategoryController =
        deps.adminSoftDeleteCategoryController ??
        new AdminSoftDeleteCategoryController(deps.adminSoftDeleteUseCase ?? adminUc!);
      this.adminRestoreCategoryController =
        deps.adminRestoreCategoryController ??
        new AdminRestoreCategoryController(deps.adminRestoreUseCase ?? adminUc!);
      this.adminHardDeleteCategoryController =
        deps.adminHardDeleteCategoryController ??
        new AdminHardDeleteCategoryController(deps.adminHardDeleteUseCase ?? adminUc!);
    } else {
      const getUc = getOrDeps as GetCategoriesUseCase;
      const adminUc = adminManageCategoriesUseCase!;

      this.getCategoriesController = new GetCategoriesController(getUc);
      this.getCategoryTreeController = new GetCategoryTreeController(getUc);
      this.getCategoryBySlugController = new GetCategoryBySlugController(getUc);
      this.adminGetAllCategoriesController = new AdminGetAllCategoriesController(adminUc);
      this.adminGetCategoryTreeController = new AdminGetCategoryTreeController(adminUc);
      this.adminGetMetricsController = new AdminGetMetricsController(adminUc);
      this.adminGetCategoryByIdController = new AdminGetCategoryByIdController(adminUc);
      this.adminCreateCategoryController = new AdminCreateCategoryController(adminUc);
      this.adminUpdateCategoryController = new AdminUpdateCategoryController(adminUc);
      this.adminToggleStatusController = new AdminToggleStatusController(adminUc);
      this.adminSoftDeleteCategoryController = new AdminSoftDeleteCategoryController(adminUc);
      this.adminRestoreCategoryController = new AdminRestoreCategoryController(adminUc);
      this.adminHardDeleteCategoryController = new AdminHardDeleteCategoryController(adminUc);
    }
  }

  // Public Catalog
  getCategories = (req: Request, res: Response, next: NextFunction) =>
    this.getCategoriesController.execute(req, res, next);

  getCategoryTree = (req: Request, res: Response, next: NextFunction) =>
    this.getCategoryTreeController.execute(req, res, next);

  getCategoryBySlug = (req: Request, res: Response, next: NextFunction) =>
    this.getCategoryBySlugController.execute(req, res, next);

  // Admin Management
  adminGetAllCategories = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetAllCategoriesController.execute(req, res, next);

  adminGetCategoryTree = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetCategoryTreeController.execute(req, res, next);

  adminGetMetrics = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetMetricsController.execute(req, res, next);

  adminGetCategoryById = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetCategoryByIdController.execute(req, res, next);

  adminCreateCategory = (req: Request, res: Response, next: NextFunction) =>
    this.adminCreateCategoryController.execute(req, res, next);

  adminUpdateCategory = (req: Request, res: Response, next: NextFunction) =>
    this.adminUpdateCategoryController.execute(req, res, next);

  adminToggleStatus = (req: Request, res: Response, next: NextFunction) =>
    this.adminToggleStatusController.execute(req, res, next);

  adminSoftDeleteCategory = (req: Request, res: Response, next: NextFunction) =>
    this.adminSoftDeleteCategoryController.execute(req, res, next);

  adminRestoreCategory = (req: Request, res: Response, next: NextFunction) =>
    this.adminRestoreCategoryController.execute(req, res, next);

  adminHardDeleteCategory = (req: Request, res: Response, next: NextFunction) =>
    this.adminHardDeleteCategoryController.execute(req, res, next);
}
