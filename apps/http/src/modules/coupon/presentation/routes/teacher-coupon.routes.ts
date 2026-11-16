import { Router } from "express";
import { TeacherCouponController } from "../controllers/teacher-coupon.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import validate from "@/app/middlewares/validate";
import {
  createTeacherCouponSchema,
  updateTeacherCouponSchema,
} from "../schemas/teacher-coupon.schema";

export function createTeacherCouponRouter(controller: TeacherCouponController): Router {
  const router = Router();

  // All endpoints require authenticated non-blocked users
  router.use(authMiddleware);
  router.use(isBlockedMiddleware);

  // 1. Admin Coupon Management Endpoints
  router.get(
    "/admin/all",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminListCoupons
  );
  router.patch(
    "/admin/:id/toggle-status",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminToggleStatus
  );
  router.delete(
    "/admin/:id",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminDeleteCoupon
  );

  // 2. Public / Student validate endpoint
  router.get("/validate", controller.validate);

  // 3. Protected Teacher Coupon Studio Endpoints (Strictly guarded by TEACHER, ADMIN, SUPERADMIN)
  const teacherGuards = [requireRoles("TEACHER", "ADMIN", "SUPERADMIN")];

  router.post(
    "/",
    ...teacherGuards,
    validate(createTeacherCouponSchema),
    controller.create
  );
  router.get("/my", ...teacherGuards, controller.listMyCoupons);
  router.get("/:id", ...teacherGuards, controller.getCouponById);
  router.patch(
    "/:id",
    ...teacherGuards,
    validate(updateTeacherCouponSchema),
    controller.update
  );
  router.delete("/:id", ...teacherGuards, controller.delete);

  return router;
}
