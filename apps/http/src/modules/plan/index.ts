import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaPlanRepository } from "./infrastructure/repositories/prisma-plan.repository";

// Application Use Cases
import { GetPlansUseCase } from "./application/use-cases/get-plans.usecase";
import { AdminManagePlansUseCase } from "./application/use-cases/admin-manage-plans.usecase";

// Presentation
import { PlanController } from "./presentation/controllers/plan.controller";
import { createPlanRouter } from "./presentation/routes/plan.routes";

export function createPlanModule(): {
  planRouter: Router;
  planRepo: PrismaPlanRepository;
  planController: PlanController;
} {
  const planRepo = new PrismaPlanRepository(defaultPrisma);

  const getPlansUseCase = new GetPlansUseCase(planRepo);
  const adminManagePlansUseCase = new AdminManagePlansUseCase(planRepo);

  const planController = new PlanController(
    getPlansUseCase,
    adminManagePlansUseCase
  );

  const planRouter = createPlanRouter(planController);

  return {
    planRouter,
    planRepo,
    planController,
  };
}

const defaultPlanModule = createPlanModule();
export const planRouter = defaultPlanModule.planRouter;
export default planRouter;

export * from "./domain/entities/plan.entity";
export * from "./domain/dtos/plan.dto";
export * from "./domain/repositories/plan.repository";
export { seedPlansIfEmpty } from "./infrastructure/seed/default-plans.seed";
