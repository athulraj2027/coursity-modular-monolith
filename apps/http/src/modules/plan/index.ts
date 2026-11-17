import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaPlanRepository } from "./infrastructure/repositories/prisma-plan.repository";
import { IPlanRepository } from "./domain/repositories/plan.repository";

// Application Use Cases
import { GetPlansUseCase } from "./application/use-cases/get-plans.usecase";
import { GetPlanByIdUseCase } from "./application/use-cases/get-plan-by-id.usecase";
import { AdminManagePlansUseCase } from "./application/use-cases/admin-manage-plans.usecase";
import { AdminCreatePlanUseCase } from "./application/use-cases/admin-create-plan.usecase";
import { AdminUpdatePlanUseCase } from "./application/use-cases/admin-update-plan.usecase";
import { AdminDeletePlanUseCase } from "./application/use-cases/admin-delete-plan.usecase";
import { AdminGetAllPlansUseCase } from "./application/use-cases/admin-get-all-plans.usecase";
import { AdminGetAllFeaturesUseCase } from "./application/use-cases/admin-get-all-features.usecase";

// Presentation
import { PlanController } from "./presentation/controllers/plan.controller";
import { createPlanRouter } from "./presentation/routes/plan.routes";

export interface PlanModuleDependencies {
  planRepo?: IPlanRepository;
}

export function createPlanModule(deps?: PlanModuleDependencies): {
  planRouter: Router;
  planRepo: IPlanRepository;
  planController: PlanController;
  useCases: {
    getPlansUseCase: GetPlansUseCase;
    getPlanByIdUseCase: GetPlanByIdUseCase;
    adminManagePlansUseCase: AdminManagePlansUseCase;
    adminCreatePlanUseCase: AdminCreatePlanUseCase;
    adminUpdatePlanUseCase: AdminUpdatePlanUseCase;
    adminDeletePlanUseCase: AdminDeletePlanUseCase;
    adminGetAllPlansUseCase: AdminGetAllPlansUseCase;
    adminGetAllFeaturesUseCase: AdminGetAllFeaturesUseCase;
  };
} {
  const planRepo = deps?.planRepo || new PrismaPlanRepository(defaultPrisma);

  const getPlansUseCase = new GetPlansUseCase(planRepo);
  const getPlanByIdUseCase = new GetPlanByIdUseCase(planRepo);
  const adminCreatePlanUseCase = new AdminCreatePlanUseCase(planRepo);
  const adminUpdatePlanUseCase = new AdminUpdatePlanUseCase(planRepo);
  const adminDeletePlanUseCase = new AdminDeletePlanUseCase(planRepo);
  const adminGetAllPlansUseCase = new AdminGetAllPlansUseCase(planRepo);
  const adminGetAllFeaturesUseCase = new AdminGetAllFeaturesUseCase(planRepo);
  const adminManagePlansUseCase = new AdminManagePlansUseCase(planRepo);

  const planController = new PlanController({
    getPlansUseCase,
    getPlanByIdUseCase,
    adminCreatePlanUseCase,
    adminUpdatePlanUseCase,
    adminDeletePlanUseCase,
    adminGetAllPlansUseCase,
    adminGetAllFeaturesUseCase,
    adminManagePlansUseCase,
  });

  const planRouter = createPlanRouter(planController);

  return {
    planRouter,
    planRepo,
    planController,
    useCases: {
      getPlansUseCase,
      getPlanByIdUseCase,
      adminManagePlansUseCase,
      adminCreatePlanUseCase,
      adminUpdatePlanUseCase,
      adminDeletePlanUseCase,
      adminGetAllPlansUseCase,
      adminGetAllFeaturesUseCase,
    },
  };
}

const defaultPlanModule = createPlanModule();
export const planRouter = defaultPlanModule.planRouter;
export const planRepo = defaultPlanModule.planRepo;
export default planRouter;

// Domain exports
export * from "./domain/entities/plan.entity";
export * from "./domain/dtos/plan.dto";
export * from "./domain/repositories/plan.repository";
export * from "./domain/errors/plan.errors";
export * from "./domain/policies";

// Application exports
export * from "./application/use-cases/get-plans.usecase";
export * from "./application/use-cases/get-plan-by-id.usecase";
export * from "./application/use-cases/admin-create-plan.usecase";
export * from "./application/use-cases/admin-update-plan.usecase";
export * from "./application/use-cases/admin-delete-plan.usecase";
export * from "./application/use-cases/admin-get-all-plans.usecase";
export * from "./application/use-cases/admin-get-all-features.usecase";
export * from "./application/use-cases/admin-manage-plans.usecase";

// Presentation exports
export * from "./presentation/controllers";
export * from "./presentation/schemas/plan.schema";
export * from "./presentation/validators/plan.validator";
export * from "./presentation/routes/plan.routes";
export { seedPlansIfEmpty } from "./infrastructure/seed/default-plans.seed";
