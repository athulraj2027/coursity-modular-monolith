// Repositories
import { PrismaPlanRepository } from "./infrastructure/repositories/prisma-plan.repository";
import { PrismaSubscriptionRepository } from "./infrastructure/repositories/prisma-subscription.repository";
import { PrismaUsageRepository } from "./infrastructure/repositories/prisma-usage.repository";

// Domain Services
import { QuotaEnforcementService } from "./domain/services/quota-enforcement.service";

// Use Cases
import { GetPlansUseCase } from "./application/use-cases/get-plans.usecase";
import { GetTeacherSubscriptionUseCase } from "./application/use-cases/get-teacher-subscription.usecase";
import { SubscribePlanUseCase } from "./application/use-cases/subscribe-plan.usecase";
import { CancelSubscriptionUseCase } from "./application/use-cases/cancel-subscription.usecase";
import { RecordUsageUseCase } from "./application/use-cases/record-usage.usecase";
import { CheckQuotaUseCase } from "./application/use-cases/check-quota.usecase";
import { AdminManagePlansUseCase } from "./application/use-cases/admin-manage-plans.usecase";

// Controllers & Routes
import { PlanController } from "./presentation/controllers/plan.controller";
import { PlanRoutes } from "./presentation/routes/plan.routes";

// 1. Instantiate Repositories
const planRepository = new PrismaPlanRepository();
const subscriptionRepository = new PrismaSubscriptionRepository();
const usageRepository = new PrismaUsageRepository();

// 2. Instantiate Domain Services
const quotaEnforcementService = new QuotaEnforcementService(
  subscriptionRepository,
  usageRepository,
  planRepository
);

// 3. Instantiate Use Cases
const getPlansUseCase = new GetPlansUseCase(planRepository);
const getTeacherSubscriptionUseCase = new GetTeacherSubscriptionUseCase(
  subscriptionRepository,
  usageRepository,
  planRepository
);
const subscribePlanUseCase = new SubscribePlanUseCase(
  subscriptionRepository,
  planRepository
);
const cancelSubscriptionUseCase = new CancelSubscriptionUseCase(subscriptionRepository);
const recordUsageUseCase = new RecordUsageUseCase(
  subscriptionRepository,
  usageRepository
);
const checkQuotaUseCase = new CheckQuotaUseCase(quotaEnforcementService);
const adminManagePlansUseCase = new AdminManagePlansUseCase(planRepository);

// 4. Instantiate Controller & Router
const planController = new PlanController(
  getPlansUseCase,
  getTeacherSubscriptionUseCase,
  subscribePlanUseCase,
  cancelSubscriptionUseCase,
  recordUsageUseCase,
  checkQuotaUseCase,
  adminManagePlansUseCase
);

const planRoutes = new PlanRoutes(planController);

// Exports
export * from "./domain/entities/plan.entity";
export * from "./domain/dtos/plan.dto";
export * from "./domain/repositories/plan.repository";
export * from "./domain/services/quota-enforcement.service";
export * from "./infrastructure/repositories/prisma-plan.repository";
export * from "./infrastructure/repositories/prisma-subscription.repository";
export * from "./infrastructure/repositories/prisma-usage.repository";
export * from "./application/use-cases/get-plans.usecase";
export * from "./application/use-cases/get-teacher-subscription.usecase";
export * from "./application/use-cases/subscribe-plan.usecase";
export * from "./application/use-cases/cancel-subscription.usecase";
export * from "./application/use-cases/record-usage.usecase";
export * from "./application/use-cases/check-quota.usecase";
export * from "./application/use-cases/admin-manage-plans.usecase";
export * from "./presentation/controllers/plan.controller";
export * from "./presentation/validators/plan.validator";
export * from "./presentation/routes/plan.routes";

export const planRouter = planRoutes.router;
export { quotaEnforcementService };
export default planRouter;
