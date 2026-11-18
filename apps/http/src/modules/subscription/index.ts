import { Router, RequestHandler } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import defaultPaymentGateway, { IPaymentGateway } from "@/infrastructure/payment";
import { emailService as defaultEmailService, IEmailService } from "@/infrastructure/email";
import { PrismaSubscriptionRepository } from "./infrastructure/repositories/prisma-subscription.repository";
import { PrismaPlanRepository } from "@/modules/plan/infrastructure/repositories/prisma-plan.repository";
import { IPlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { PrismaOfferRepository } from "@/modules/offer/infrastructure/repositories/prisma-offer.repository";
import { IOfferRepository } from "@/modules/offer/domain/repositories/offer.repository";
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
import { ITeacherProfileResolver } from "./presentation/controllers/get-my-subscription.controller";
import { createSubscriptionRouter } from "./presentation/routes/subscription.routes";
import { SubscriptionRepository } from "./domain/repositories/subscription.repository";

export interface SubscriptionModuleDependencies {
  subscriptionRepo?: SubscriptionRepository;
  planRepo?: IPlanRepository;
  offerRepo?: IOfferRepository;
  getPlanOfferUseCase?: GetPlanOfferUseCase;
  paymentGateway?: IPaymentGateway;
  emailService?: IEmailService;
  profileRepo?: ITeacherProfileResolver;
  authMiddleware?: RequestHandler;
  requireRolesMiddleware?: (...roles: string[]) => RequestHandler;
}

export function createSubscriptionModule(deps: SubscriptionModuleDependencies = {}): {
  subscriptionRouter: Router;
  subscriptionRepo: SubscriptionRepository;
  subscriptionController: SubscriptionController;
  useCases: {
    getTeacherSubscriptionUseCase: GetTeacherSubscriptionUseCase;
    subscribePlanUseCase: SubscribePlanUseCase;
    cancelSubscriptionUseCase: CancelSubscriptionUseCase;
    recordUsageUseCase: RecordUsageUseCase;
    checkQuotaUseCase: CheckQuotaUseCase;
    createRazorpayOrderUseCase: CreateRazorpayOrderUseCase;
    verifyRazorpayPaymentUseCase: VerifyRazorpayPaymentUseCase;
    getInvoicesUseCase: GetInvoicesUseCase;
    adminGetSubscriptionsUseCase: AdminGetSubscriptionsUseCase;
    adminGetSubscriptionDetailUseCase: AdminGetSubscriptionDetailUseCase;
    adminCancelSubscriptionUseCase: AdminCancelSubscriptionUseCase;
    adminRefundSubscriptionUseCase: AdminRefundSubscriptionUseCase;
    adminExtendSubscriptionUseCase: AdminExtendSubscriptionUseCase;
    adminChangeSubscriptionPlanUseCase: AdminChangeSubscriptionPlanUseCase;
  };
} {
  const subscriptionRepo = deps.subscriptionRepo ?? new PrismaSubscriptionRepository(defaultPrisma);
  const planRepo = deps.planRepo ?? new PrismaPlanRepository(defaultPrisma);
  const offerRepo = deps.offerRepo ?? new PrismaOfferRepository(defaultPrisma);
  const paymentGateway = deps.paymentGateway ?? defaultPaymentGateway;
  const emailService = deps.emailService ?? defaultEmailService;
  const getPlanOfferUseCase =
    deps.getPlanOfferUseCase ?? new GetPlanOfferUseCase(offerRepo, planRepo);

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
  const getInvoicesUseCase = new GetInvoicesUseCase(subscriptionRepo);

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
    adminChangeSubscriptionPlanUseCase,
    deps.profileRepo
  );

  const subscriptionRouter = createSubscriptionRouter(subscriptionController, {
    authMiddleware: deps.authMiddleware,
    requireRolesMiddleware: deps.requireRolesMiddleware,
  });

  return {
    subscriptionRouter,
    subscriptionRepo,
    subscriptionController,
    useCases: {
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
      adminChangeSubscriptionPlanUseCase,
    },
  };
}

const defaultSubscriptionModule = createSubscriptionModule();
export const subscriptionRouter = defaultSubscriptionModule.subscriptionRouter;
export const subscriptionRepo = defaultSubscriptionModule.subscriptionRepo;
export default subscriptionRouter;

// Domain & Contract Exports
export * from "./domain/entities/subscription.entity";
export * from "./domain/constants/billing.constants";
export * from "./domain/policies";
export * from "./domain/errors";
export * from "./domain/dtos/subscription.dto";
export * from "./domain/repositories/subscription.repository";

// Infrastructure Exports
export * from "./infrastructure/repositories/prisma-subscription.repository";

// Application Exports
export * from "./application/use-cases/get-teacher-subscription.usecase";
export * from "./application/use-cases/subscribe-plan.usecase";
export * from "./application/use-cases/cancel-subscription.usecase";
export * from "./application/use-cases/record-usage.usecase";
export * from "./application/use-cases/check-quota.usecase";
export * from "./application/use-cases/create-razorpay-order.usecase";
export * from "./application/use-cases/verify-razorpay-payment.usecase";
export * from "./application/use-cases/get-invoices.usecase";
export * from "./application/use-cases/admin-get-subscriptions.usecase";
export * from "./application/use-cases/admin-get-subscription-detail.usecase";
export * from "./application/use-cases/admin-cancel-subscription.usecase";
export * from "./application/use-cases/admin-refund-subscription.usecase";
export * from "./application/use-cases/admin-extend-subscription.usecase";
export * from "./application/use-cases/admin-change-subscription-plan.usecase";

// Presentation Exports
export * from "./presentation/schemas";
export * from "./presentation/validators/subscription.validator";
export * from "./presentation/controllers";
export * from "./presentation/routes/subscription.routes";
