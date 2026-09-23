import { Router } from "express";
import { OfferController } from "../controllers/offer.controller";
import { authMiddleware, optionalAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import validate from "@/app/middlewares/validate";
import {
  createOfferSchema,
  updateOfferSchema,
} from "../schemas/offer.schema";

export const createOfferRouter = (controller: OfferController): Router => {
  const router = Router();

  // 1. Public / Teacher Endpoints
  router.get("/plan-offer", optionalAuthMiddleware, controller.getPlanOffer);
  router.get("/active", controller.getActiveOffers);
  // Alias for backward compatibility during rollout
  router.get("/auto-applied", controller.getActiveOffers);

  // 2. Admin Management Endpoints
  router.get(
    "/admin/offers",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminListOffers
  );
  router.get(
    "/admin/offers/analytics",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminGetAnalytics
  );
  router.post(
    "/admin/offers",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(createOfferSchema),
    controller.adminCreateOffer
  );
  router.put(
    "/admin/offers/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    validate(updateOfferSchema),
    controller.adminUpdateOffer
  );
  router.patch(
    "/admin/offers/:id/toggle",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminToggleOffer
  );
  router.delete(
    "/admin/offers/:id",
    authMiddleware,
    requireRoles("ADMIN", "SUPERADMIN"),
    controller.adminDeleteOffer
  );

  return router;
};

export default createOfferRouter;
