import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaOfferRepository } from "./infrastructure/repositories/prisma-offer.repository";
import { PrismaPlanRepository } from "@/modules/plan/infrastructure/repositories/prisma-plan.repository";

// Application Use Cases
import { GetPlanOfferUseCase } from "./application/use-cases/get-plan-offer.usecase";
import { GetActiveOffersUseCase } from "./application/use-cases/get-active-offers.usecase";
import { AdminCreateOfferUseCase } from "./application/use-cases/admin-create-offer.usecase";
import { AdminUpdateOfferUseCase } from "./application/use-cases/admin-update-offer.usecase";
import { AdminListOffersUseCase } from "./application/use-cases/admin-list-offers.usecase";
import { AdminToggleOfferUseCase } from "./application/use-cases/admin-toggle-offer.usecase";
import { AdminDeleteOfferUseCase } from "./application/use-cases/admin-delete-offer.usecase";
import { AdminGetOfferAnalyticsUseCase } from "./application/use-cases/admin-get-offer-analytics.usecase";

// Presentation
import { OfferController } from "./presentation/controllers/offer.controller";
import { createOfferRouter } from "./presentation/routes/offer.routes";

export function createOfferModule(): {
  offerRouter: Router;
  offerRepo: PrismaOfferRepository;
  offerController: OfferController;
  getPlanOfferUseCase: GetPlanOfferUseCase;
  getActiveOffersUseCase: GetActiveOffersUseCase;
} {
  const offerRepo = new PrismaOfferRepository(defaultPrisma);
  const planRepo = new PrismaPlanRepository(defaultPrisma);

  const getPlanOfferUseCase = new GetPlanOfferUseCase(offerRepo, planRepo);
  const getActiveOffersUseCase = new GetActiveOffersUseCase(offerRepo);
  const adminCreateOfferUseCase = new AdminCreateOfferUseCase(offerRepo);
  const adminUpdateOfferUseCase = new AdminUpdateOfferUseCase(offerRepo);
  const adminListOffersUseCase = new AdminListOffersUseCase(offerRepo);
  const adminToggleOfferUseCase = new AdminToggleOfferUseCase(offerRepo);
  const adminDeleteOfferUseCase = new AdminDeleteOfferUseCase(offerRepo);
  const adminGetOfferAnalyticsUseCase = new AdminGetOfferAnalyticsUseCase(offerRepo);

  const offerController = new OfferController(
    getPlanOfferUseCase,
    getActiveOffersUseCase,
    adminCreateOfferUseCase,
    adminUpdateOfferUseCase,
    adminListOffersUseCase,
    adminToggleOfferUseCase,
    adminDeleteOfferUseCase,
    adminGetOfferAnalyticsUseCase
  );

  const offerRouter = createOfferRouter(offerController);

  return {
    offerRouter,
    offerRepo,
    offerController,
    getPlanOfferUseCase,
    getActiveOffersUseCase,
  };
}

const defaultOfferModule = createOfferModule();
export const offerRepo = defaultOfferModule.offerRepo;
export const offerRouter = defaultOfferModule.offerRouter;
export const getPlanOfferUseCase = defaultOfferModule.getPlanOfferUseCase;
export const getActiveOffersUseCase = defaultOfferModule.getActiveOffersUseCase;
export default offerRouter;

export * from "./domain/entities/offer.entity";
export * from "./domain/dtos/offer.dto";
export * from "./domain/repositories/offer.repository";
export * from "./infrastructure/seed/default-offers.seed";
