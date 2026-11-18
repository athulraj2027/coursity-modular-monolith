import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export const createCategoryRouter = (categoryController: CategoryController): Router => {
  const router = Router();

  // 1. Public Endpoints (Accessible for course catalogs, navbar, search filters)
  router.get("/", categoryController.getCategories);
  router.get("/tree", categoryController.getCategoryTree);
  router.get("/slug/:slug", categoryController.getCategoryBySlug);

  // 2. Protected Admin Endpoints (Guarded with ADMIN and SUPERADMIN roles)
  const adminGuards = [
    authMiddleware,
    isBlockedMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
  ];

  router.get("/admin/all", ...adminGuards, categoryController.adminGetAllCategories);
  router.get("/admin/tree", ...adminGuards, categoryController.adminGetCategoryTree);
  router.get("/admin/metrics", ...adminGuards, categoryController.adminGetMetrics);
  router.get("/admin/:id", ...adminGuards, categoryController.adminGetCategoryById);
  router.post("/admin", ...adminGuards, categoryController.adminCreateCategory);
  router.put("/admin/:id", ...adminGuards, categoryController.adminUpdateCategory);
  router.patch("/admin/:id/status", ...adminGuards, categoryController.adminToggleStatus);
  router.delete("/admin/:id", ...adminGuards, categoryController.adminSoftDeleteCategory);
  router.post("/admin/:id/restore", ...adminGuards, categoryController.adminRestoreCategory);
  router.delete("/admin/:id/permanent", ...adminGuards, categoryController.adminHardDeleteCategory);

  return router;
};

export class CategoryRoutes {
  public router: Router;

  constructor(private readonly categoryController: CategoryController) {
    this.router = createCategoryRouter(categoryController);
  }
}
