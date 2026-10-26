import { Request, Response, NextFunction } from "express";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";

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
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase
  ) {
    this.getCategoriesController = new GetCategoriesController(getCategoriesUseCase);
    this.getCategoryTreeController = new GetCategoryTreeController(getCategoriesUseCase);
    this.getCategoryBySlugController = new GetCategoryBySlugController(getCategoriesUseCase);
    this.adminGetAllCategoriesController = new AdminGetAllCategoriesController(adminManageCategoriesUseCase);
    this.adminGetCategoryTreeController = new AdminGetCategoryTreeController(adminManageCategoriesUseCase);
    this.adminGetMetricsController = new AdminGetMetricsController(adminManageCategoriesUseCase);
    this.adminGetCategoryByIdController = new AdminGetCategoryByIdController(adminManageCategoriesUseCase);
    this.adminCreateCategoryController = new AdminCreateCategoryController(adminManageCategoriesUseCase);
    this.adminUpdateCategoryController = new AdminUpdateCategoryController(adminManageCategoriesUseCase);
    this.adminToggleStatusController = new AdminToggleStatusController(adminManageCategoriesUseCase);
    this.adminSoftDeleteCategoryController = new AdminSoftDeleteCategoryController(adminManageCategoriesUseCase);
    this.adminRestoreCategoryController = new AdminRestoreCategoryController(adminManageCategoriesUseCase);
    this.adminHardDeleteCategoryController = new AdminHardDeleteCategoryController(adminManageCategoriesUseCase);
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
