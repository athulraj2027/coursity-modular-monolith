import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import paymentGateway from "@/infrastructure/payment";
import { emailService } from "@/infrastructure/email";
import { PrismaSubscriptionRepository } from "./infrastructure/repositories/prisma-subscription.repository";
import { PrismaPlanRepository } from "@/modules/plan/infrastructure/repositories/prisma-plan.repository";
import { PrismaOfferRepository } from "@/modules/offer/infrastructure/repositories/prisma-offer.repository";
import { GetPlanOfferUseCase } from "@/modules/offer/application/use-cases/get-plan-offer.usecase";

// Application Use Cases
import { GetTeacherSubscriptionUseCase } from "./application/use-cases/get-teacher-subscription.usecase";
import { SubscribePlanUseCase } from "./application/use-cases/subscribe-plan.usecase";
import { CancelSubscriptionUseCase } from "./application/use-cases/cancel-subscription.usecase";
import { RecordUsageUseCase } from "./application/use-cases/record-usage.usecase";
import { CheckQuotaUseCase } from "./application/use-cases/check-quota.usecase";
import { CreateRazorpayOrderUseCase } from "./application/use-cases/create-razorpay-order.usecase";
import { VerifyRazorpayPaymentUseCase } from "./application/use-cases/verify-razorpay-payment.usecase";
import { GetInvoicesUseCase } from "./application/use-cases/get-invoices.usecase";
import { AdminGetSubscriptionsUseCase } from "./application/use-cases/admin-get-subscriptions.usecase";
import { AdminGetSubscriptionDetailUseCase } from "./application/use-cases/admin-get-subscription-detail.usecase";
import { AdminCancelSubscriptionUseCase } from "./application/use-cases/admin-cancel-subscription.usecase";
import { AdminRefundSubscriptionUseCase } from "./application/use-cases/admin-refund-subscription.usecase";
import { AdminExtendSubscriptionUseCase } from "./application/use-cases/admin-extend-subscription.usecase";
import { AdminChangeSubscriptionPlanUseCase } from "./application/use-cases/admin-change-subscription-plan.usecase";

// Presentation
import { SubscriptionController } from "./presentation/controllers/subscription.controller";
import { createSubscriptionRouter } from "./presentation/routes/subscription.routes";

export function createSubscriptionModule(): {
  subscriptionRouter: Router;
  subscriptionRepo: PrismaSubscriptionRepository;
  subscriptionController: SubscriptionController;
} {
  const subscriptionRepo = new PrismaSubscriptionRepository(defaultPrisma);
  const planRepo = new PrismaPlanRepository(defaultPrisma);
  const offerRepo = new PrismaOfferRepository(defaultPrisma);
  const getPlanOfferUseCase = new GetPlanOfferUseCase(offerRepo, planRepo);

  const getTeacherSubscriptionUseCase = new GetTeacherSubscriptionUseCase(subscriptionRepo, planRepo);
  const subscribePlanUseCase = new SubscribePlanUseCase(subscriptionRepo, planRepo);
  const cancelSubscriptionUseCase = new CancelSubscriptionUseCase(subscriptionRepo);
  const recordUsageUseCase = new RecordUsageUseCase(subscriptionRepo);
  const checkQuotaUseCase = new CheckQuotaUseCase(subscriptionRepo);
  const createRazorpayOrderUseCase = new CreateRazorpayOrderUseCase(
    planRepo,
    paymentGateway,
    getPlanOfferUseCase,
    subscriptionRepo
  );
  const verifyRazorpayPaymentUseCase = new VerifyRazorpayPaymentUseCase(
    subscriptionRepo,
    planRepo,
    paymentGateway,
    emailService,
    offerRepo,
    getPlanOfferUseCase
  );
  const getInvoicesUseCase = new GetInvoicesUseCase();

  const adminGetSubscriptionsUseCase = new AdminGetSubscriptionsUseCase(subscriptionRepo);
  const adminGetSubscriptionDetailUseCase = new AdminGetSubscriptionDetailUseCase(subscriptionRepo);
  const adminCancelSubscriptionUseCase = new AdminCancelSubscriptionUseCase(subscriptionRepo);
  const adminRefundSubscriptionUseCase = new AdminRefundSubscriptionUseCase(
    subscriptionRepo,
    paymentGateway,
    emailService
  );
  const adminExtendSubscriptionUseCase = new AdminExtendSubscriptionUseCase(subscriptionRepo);
  const adminChangeSubscriptionPlanUseCase = new AdminChangeSubscriptionPlanUseCase(
    subscriptionRepo,
    planRepo
  );

  const subscriptionController = new SubscriptionController(
    getTeacherSubscriptionUseCase,
    subscribePlanUseCase,
    cancelSubscriptionUseCase,
    recordUsageUseCase,
    checkQuotaUseCase,
    createRazorpayOrderUseCase,
    verifyRazorpayPaymentUseCase,
    getInvoicesUseCase,
    adminGetSubscriptionsUseCase,
    adminGetSubscriptionDetailUseCase,
    adminCancelSubscriptionUseCase,
    adminRefundSubscriptionUseCase,
    adminExtendSubscriptionUseCase,
    adminChangeSubscriptionPlanUseCase
  );

  const subscriptionRouter = createSubscriptionRouter(subscriptionController);

  return {
    subscriptionRouter,
    subscriptionRepo,
    subscriptionController,
  };
}

const defaultSubscriptionModule = createSubscriptionModule();
export const subscriptionRouter = defaultSubscriptionModule.subscriptionRouter;
export default subscriptionRouter;

export * from "./domain/entities/subscription.entity";
export * from "./domain/constants/billing.constants";
export * from "./domain/dtos/subscription.dto";
export * from "./domain/repositories/subscription.repository";
