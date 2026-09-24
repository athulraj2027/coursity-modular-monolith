import { Router } from "express";
import { BankDetailController } from "../controllers/bank-detail.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import validate from "@/app/middlewares/validate";
import {
  createBankDetailSchema,
  updateBankVerificationSchema,
} from "../schemas/bank-detail.schema";

export const createBankDetailRouter = (
  controller: BankDetailController
): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // 1. Admin Bank Accounts Endpoints (Protected - Admin)
  router.get(
    "/admin/all",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAll
  );

  router.get(
    "/admin",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAll
  );

  router.get(
    "/all",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAll
  );

  router.get(
    "/admin/:id",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetById
  );

  router.patch(
    "/admin/:id/verification",
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(updateBankVerificationSchema),
    controller.adminUpdateVerification
  );

  router.patch(
    "/:id/verification",
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(updateBankVerificationSchema),
    controller.adminUpdateVerification
  );

  // 2. User Bank Accounts Endpoints (Students & Teachers)
  router.get("/my", controller.getMyBankDetails);
  router.get("/", controller.getMyBankDetails);
  router.get("", controller.getMyBankDetails);
  router.post("/", validate(createBankDetailSchema), controller.createBankDetail);
  router.post("", validate(createBankDetailSchema), controller.createBankDetail);
  router.patch("/:id/primary", controller.setPrimary);
  router.delete("/:id", controller.deleteBankDetail);
  router.get("/:id", controller.adminGetById);

  return router;
};
