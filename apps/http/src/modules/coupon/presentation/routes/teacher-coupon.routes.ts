import { Router } from "express";
import { TeacherCouponController } from "../controllers/teacher-coupon.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export function createTeacherCouponRouter(controller: TeacherCouponController): Router {
  const router = Router();

  // 1. Admin Coupon Management Endpoints
  router.get(
    "/admin/all",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminListCoupons
  );
  router.patch(
    "/admin/:id/toggle-status",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminToggleStatus
  );
  router.delete(
    "/admin/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminDeleteCoupon
  );

  // 2. Public / Student validate endpoint
  router.get("/validate", authMiddleware, isBlockedMiddleware, controller.validate);

  // 3. Protected Teacher Coupon Studio Endpoints
  router.post("/", authMiddleware, isBlockedMiddleware, controller.create);
  router.get("/my", authMiddleware, isBlockedMiddleware, controller.listMyCoupons);
  router.get("/:id", authMiddleware, isBlockedMiddleware, controller.getCouponById);
  router.patch("/:id", authMiddleware, isBlockedMiddleware, controller.update);
  router.delete("/:id", authMiddleware, isBlockedMiddleware, controller.delete);

  return router;
}

