import { Router } from "express";
import { PlanController } from "../controllers/plan.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";

export class PlanRoutes {
  public router: Router;

  constructor(private readonly planController: PlanController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 1. Public endpoint (List active plans & features)
    this.router.get("/", this.planController.getPlans);

    // 2. Protected Teacher Endpoints
    this.router.get(
      "/my-subscription",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.getMySubscription
    );

    this.router.post(
      "/subscribe",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.subscribe
    );

    this.router.post(
      "/cancel",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.cancelSubscription
    );

    this.router.get(
      "/check-quota",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.checkQuota
    );

    this.router.post(
      "/record-usage",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.recordUsage
    );

    // 3. Admin Management Endpoints
    this.router.get(
      "/admin/all",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminGetAllPlans
    );

    this.router.get(
      "/admin/features",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminGetAllFeatures
    );

    this.router.get(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminGetPlanById
    );

    this.router.post(
      "/admin",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminCreatePlan
    );

    this.router.put(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminUpdatePlan
    );

    this.router.delete(
      "/admin/:id",
      authMiddleware,
      isBlockedMiddleware,
      this.planController.adminDeletePlan
    );
  }
}
