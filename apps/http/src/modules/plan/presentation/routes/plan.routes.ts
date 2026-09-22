import { Router } from "express";
import { PlanController } from "../controllers/plan.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export const createPlanRouter = (controller: PlanController): Router => {
  const router = Router();

  // 1. Public / Authenticated Catalog
  router.get("/", controller.getPlans);

  // 2. Admin Plans & Features Catalog (Protected - Admin)
  router.get(
    "/admin/all",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAllPlans
  );
  router.get(
    "/admin/features",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAllFeatures
  );
  router.post(
    "/admin",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminCreatePlan
  );
  router.get(
    "/admin/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetPlanById
  );
  router.put(
    "/admin/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminUpdatePlan
  );
  router.delete(
    "/admin/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminDeletePlan
  );

  // 3. Plan by ID (Public) - placed last to avoid shadowing static routes
  router.get("/:id", controller.getPlanById);

  return router;
};
