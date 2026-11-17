import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaOfferRepository } from "./infrastructure/repositories/prisma-offer.repository";
import { PrismaPlanRepository } from "@/modules/plan/infrastructure/repositories/prisma-plan.repository";
import {
  IOfferRepository,
  IPlanLookupRepository,
} from "./domain/repositories/offer.repository";

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
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export interface OfferModuleDependencies {
  offerRepo?: IOfferRepository;
  planRepo?: IPlanLookupRepository;
  teacherProfileResolver?: ITeacherProfileResolver;
}

export function createOfferModule(deps?: OfferModuleDependencies): {
  offerRouter: Router;
  offerRepo: IOfferRepository;
  offerController: OfferController;
  getPlanOfferUseCase: GetPlanOfferUseCase;
  getActiveOffersUseCase: GetActiveOffersUseCase;
  useCases: {
    getPlanOfferUseCase: GetPlanOfferUseCase;
    getActiveOffersUseCase: GetActiveOffersUseCase;
    adminCreateOfferUseCase: AdminCreateOfferUseCase;
    adminUpdateOfferUseCase: AdminUpdateOfferUseCase;
    adminListOffersUseCase: AdminListOffersUseCase;
    adminToggleOfferUseCase: AdminToggleOfferUseCase;
    adminDeleteOfferUseCase: AdminDeleteOfferUseCase;
    adminGetOfferAnalyticsUseCase: AdminGetOfferAnalyticsUseCase;
  };
} {
  const offerRepo = deps?.offerRepo || new PrismaOfferRepository(defaultPrisma);
  const planRepo = deps?.planRepo || (new PrismaPlanRepository(defaultPrisma) as any);
  const profileResolver = deps?.teacherProfileResolver || defaultTeacherProfileResolver;

  const getPlanOfferUseCase = new GetPlanOfferUseCase(offerRepo, planRepo);
  const getActiveOffersUseCase = new GetActiveOffersUseCase(offerRepo);
  const adminCreateOfferUseCase = new AdminCreateOfferUseCase(offerRepo);
  const adminUpdateOfferUseCase = new AdminUpdateOfferUseCase(offerRepo);
  const adminListOffersUseCase = new AdminListOffersUseCase(offerRepo);
  const adminToggleOfferUseCase = new AdminToggleOfferUseCase(offerRepo);
  const adminDeleteOfferUseCase = new AdminDeleteOfferUseCase(offerRepo);
  const adminGetOfferAnalyticsUseCase = new AdminGetOfferAnalyticsUseCase(offerRepo);

  const offerController = new OfferController({
    getPlanOfferUseCase,
    getActiveOffersUseCase,
    adminCreateOfferUseCase,
    adminUpdateOfferUseCase,
    adminListOffersUseCase,
    adminToggleOfferUseCase,
    adminDeleteOfferUseCase,
    adminGetOfferAnalyticsUseCase,
    profileResolver,
  });

  const offerRouter = createOfferRouter(offerController);

  return {
    offerRouter,
    offerRepo,
    offerController,
    getPlanOfferUseCase,
    getActiveOffersUseCase,
    useCases: {
      getPlanOfferUseCase,
      getActiveOffersUseCase,
      adminCreateOfferUseCase,
      adminUpdateOfferUseCase,
      adminListOffersUseCase,
      adminToggleOfferUseCase,
      adminDeleteOfferUseCase,
      adminGetOfferAnalyticsUseCase,
    },
  };
}

const defaultOfferModule = createOfferModule();
export const offerRepo = defaultOfferModule.offerRepo;
export const offerRouter = defaultOfferModule.offerRouter;
export const getPlanOfferUseCase = defaultOfferModule.getPlanOfferUseCase;
export const getActiveOffersUseCase = defaultOfferModule.getActiveOffersUseCase;
export default offerRouter;

// Domain exports
export * from "./domain/entities/offer.entity";
export * from "./domain/dtos/offer.dto";
export * from "./domain/repositories/offer.repository";
export * from "./domain/errors/offer.errors";
export * from "./domain/policies";

// Application exports
export * from "./application/use-cases/get-plan-offer.usecase";
export * from "./application/use-cases/get-active-offers.usecase";
export * from "./application/use-cases/admin-create-offer.usecase";
export * from "./application/use-cases/admin-update-offer.usecase";
export * from "./application/use-cases/admin-list-offers.usecase";
export * from "./application/use-cases/admin-toggle-offer.usecase";
export * from "./application/use-cases/admin-delete-offer.usecase";
export * from "./application/use-cases/admin-get-offer-analytics.usecase";

// Presentation exports
export * from "./presentation/controllers";
export * from "./presentation/schemas/offer.schema";
export * from "./presentation/routes/offer.routes";
export * from "./infrastructure/seed/default-offers.seed";
