import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export const createSubscriptionRouter = (controller: SubscriptionController): Router => {
  const router = Router();

  // 1. Teacher Subscription Operations (Protected)
  router.get("/my-subscription", authMiddleware, controller.getMySubscription);
  router.post("/subscribe", authMiddleware, controller.subscribe);
  router.post("/cancel", authMiddleware, controller.cancelSubscription);
  router.get("/invoices", authMiddleware, controller.getInvoices);

  // 2. Razorpay Order & Signature Verification (Protected)
  router.post("/razorpay/order", authMiddleware, controller.createRazorpayOrder);
  router.post("/razorpay/create-order", authMiddleware, controller.createRazorpayOrder);
  router.post("/razorpay/verify", authMiddleware, controller.verifyRazorpayPayment);

  // 3. Quotas & Usage Tracking (Protected)
  router.get("/quota/check", authMiddleware, controller.checkQuota);
  router.post("/usage/record", authMiddleware, controller.recordUsage);

  // 4. Admin Subscriptions Management (Protected - Admin)
  router.get(
    "/admin/subscriptions",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetSubscriptions
  );
  router.get(
    "/admin/subscriptions/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetSubscriptionDetail
  );
  router.post(
    "/admin/subscriptions/:id/cancel",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminCancelSubscription
  );
  router.post(
    "/admin/subscriptions/:id/refund",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminRefundSubscription
  );
  router.post(
    "/admin/subscriptions/:id/extend",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminExtendSubscription
  );
  router.post(
    "/admin/subscriptions/:id/change-plan",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminChangeSubscriptionPlan
  );

  return router;
};
