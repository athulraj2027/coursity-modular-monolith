import { Router, RequestHandler } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";
import { authMiddleware as defaultAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles as defaultRequireRoles } from "@/app/middlewares/role.middleware";

export interface SubscriptionRouteOptions {
  authMiddleware?: RequestHandler;
  requireRolesMiddleware?: (...roles: string[]) => RequestHandler;
}

export const createSubscriptionRouter = (
  controller: SubscriptionController,
  options: SubscriptionRouteOptions = {}
): Router => {
  const router = Router();
  const auth = options.authMiddleware ?? defaultAuthMiddleware;
  const roles = options.requireRolesMiddleware ?? defaultRequireRoles;

  // 1. Teacher Subscription Operations (Protected)
  router.get("/my-subscription", auth, controller.getMySubscription);
  router.post("/subscribe", auth, controller.subscribe);
  router.post("/cancel", auth, controller.cancelSubscription);
  router.get("/invoices", auth, controller.getInvoices);

  // 2. Razorpay Order & Signature Verification (Protected)
  router.post("/razorpay/order", auth, controller.createRazorpayOrder);
  router.post("/razorpay/create-order", auth, controller.createRazorpayOrder);
  router.post("/razorpay/verify", auth, controller.verifyRazorpayPayment);

  // 3. Quotas & Usage Tracking (Protected)
  router.get("/quota/check", auth, controller.checkQuota);
  router.post("/usage/record", auth, controller.recordUsage);

  // 4. Admin Subscriptions Management (Protected - Admin)
  router.get(
    "/admin/subscriptions",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminGetSubscriptions
  );
  router.get(
    "/admin/subscriptions/:id",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminGetSubscriptionDetail
  );
  router.post(
    "/admin/subscriptions/:id/cancel",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminCancelSubscription
  );
  router.post(
    "/admin/subscriptions/:id/refund",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminRefundSubscription
  );
  router.post(
    "/admin/subscriptions/:id/extend",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminExtendSubscription
  );
  router.post(
    "/admin/subscriptions/:id/change-plan",
    auth,
    roles("ADMIN", "SUPERADMIN"),
    controller.adminChangeSubscriptionPlan
  );

  return router;
};
