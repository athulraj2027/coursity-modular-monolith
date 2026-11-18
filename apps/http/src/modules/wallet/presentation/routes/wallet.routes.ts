import { Router, RequestHandler } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { authMiddleware as defaultAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import validate from "@/app/middlewares/validate";
import {
  createTopUpOrderSchema,
  verifyTopUpPaymentSchema,
  requestPayoutSchema,
  adminProcessPayoutSchema,
  adminWalletAdjustmentSchema,
} from "../schemas/wallet.schema";

export interface WalletRouterOptions {
  authMiddleware?: RequestHandler;
  adminMiddleware?: RequestHandler;
}

export const createWalletRouter = (
  controller: WalletController,
  options: WalletRouterOptions = {}
): Router => {
  const router = Router();
  const auth = options.authMiddleware ?? defaultAuthMiddleware;
  const admin = options.adminMiddleware ?? requireRoles("ADMIN", "SUPERADMIN");

  // All wallet routes require authenticated user
  router.use(auth);

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
  router.get("/admin/wallets", admin, controller.adminGetAllWallets);
  router.get("/admin/payouts", admin, controller.adminGetAllPayouts);
  router.patch(
    "/admin/payouts/:id",
    admin,
    validate(adminProcessPayoutSchema),
    controller.adminProcessPayout
  );
  router.post(
    "/admin/adjustment",
    admin,
    validate(adminWalletAdjustmentSchema),
    controller.adminWalletAdjustment
  );

  return router;
};

export default createWalletRouter;
