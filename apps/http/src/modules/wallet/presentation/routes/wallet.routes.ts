import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import validate from "@/app/middlewares/validate";
import {
  createTopUpOrderSchema,
  verifyTopUpPaymentSchema,
  requestPayoutSchema,
  adminProcessPayoutSchema,
  adminWalletAdjustmentSchema,
} from "../schemas/wallet.schema";

export const createWalletRouter = (controller: WalletController): Router => {
  const router = Router();

  // All wallet routes require authenticated user
  router.use(authMiddleware);

  // ==========================================
  // 1. User Wallet Endpoints (Students & Teachers)
  // ==========================================
  router.get("/my", controller.getMyWallet);
  router.get("/", controller.getMyWallet);
  router.get("/transactions", controller.getMyTransactions);

  // Top-Up via Razorpay
  router.post(
    "/topup/create-order",
    validate(createTopUpOrderSchema),
    controller.createTopUpOrder
  );
  router.post(
    "/topup/verify",
    validate(verifyTopUpPaymentSchema),
    controller.verifyTopUpPayment
  );

  // Instructor Payout Requests
  router.post(
    "/payouts/request",
    validate(requestPayoutSchema),
    controller.requestPayout
  );
  router.get("/payouts/my", controller.getMyPayouts);
  router.get("/payouts", controller.getMyPayouts);

  // ==========================================
  // 2. Admin Wallet & Master Ledger Endpoints
  // ==========================================
  router.get(
    "/admin/wallets",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAllWallets
  );

  router.get(
    "/admin/payouts",
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAllPayouts
  );

  router.patch(
    "/admin/payouts/:id",
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(adminProcessPayoutSchema),
    controller.adminProcessPayout
  );

  router.post(
    "/admin/adjustment",
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(adminWalletAdjustmentSchema),
    controller.adminWalletAdjustment
  );

  return router;
};

export default createWalletRouter;
