import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";

export class CategoryRoutes {
  public router: Router;

  constructor(private readonly categoryController: CategoryController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 1. Public Endpoints (Accessible for course catalogs, navbar, search filters)
    this.router.get("/", this.categoryController.getCategories);
    this.router.get("/tree", this.categoryController.getCategoryTree);
    this.router.get("/slug/:slug", this.categoryController.getCategoryBySlug);

    // 2. Protected Admin Endpoints
    this.router.get(
      "/admin/all",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminGetAllCategories
    );

    this.router.get(
      "/admin/tree",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminGetCategoryTree
    );

    this.router.get(
      "/admin/metrics",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminGetMetrics
    );

    this.router.get(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminGetCategoryById
    );

    this.router.post(
      "/admin",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminCreateCategory
    );

    this.router.put(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminUpdateCategory
    );

    this.router.patch(
      "/admin/:id/status",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminToggleStatus
    );

    this.router.delete(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminSoftDeleteCategory
    );

    this.router.post(
      "/admin/:id/restore",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminRestoreCategory
    );

    this.router.delete(
      "/admin/:id/permanent",
      authMiddleware,
      isBlockedMiddleware,
      this.categoryController.adminHardDeleteCategory
    );
  }
}
