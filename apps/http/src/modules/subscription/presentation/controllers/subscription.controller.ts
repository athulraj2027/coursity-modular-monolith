import { Request, Response, NextFunction } from "express";
import { GetTeacherSubscriptionUseCase } from "../../application/use-cases/get-teacher-subscription.usecase";
import { SubscribePlanUseCase } from "../../application/use-cases/subscribe-plan.usecase";
import { CancelSubscriptionUseCase } from "../../application/use-cases/cancel-subscription.usecase";
import { RecordUsageUseCase } from "../../application/use-cases/record-usage.usecase";
import { CheckQuotaUseCase } from "../../application/use-cases/check-quota.usecase";
import { CreateRazorpayOrderUseCase } from "../../application/use-cases/create-razorpay-order.usecase";
import { VerifyRazorpayPaymentUseCase } from "../../application/use-cases/verify-razorpay-payment.usecase";
import { GetInvoicesUseCase } from "../../application/use-cases/get-invoices.usecase";
import { AdminGetSubscriptionsUseCase } from "../../application/use-cases/admin-get-subscriptions.usecase";
import { AdminGetSubscriptionDetailUseCase } from "../../application/use-cases/admin-get-subscription-detail.usecase";
import { AdminCancelSubscriptionUseCase } from "../../application/use-cases/admin-cancel-subscription.usecase";
import { AdminRefundSubscriptionUseCase } from "../../application/use-cases/admin-refund-subscription.usecase";
import { AdminExtendSubscriptionUseCase } from "../../application/use-cases/admin-extend-subscription.usecase";
import { AdminChangeSubscriptionPlanUseCase } from "../../application/use-cases/admin-change-subscription-plan.usecase";

import { GetMySubscriptionController } from "./get-my-subscription.controller";
import { SubscribePlanController } from "./subscribe-plan.controller";
import { CreateRazorpayOrderController } from "./create-razorpay-order.controller";
import { VerifyRazorpayPaymentController } from "./verify-razorpay-payment.controller";
import { GetInvoicesController } from "./get-invoices.controller";
import { CancelSubscriptionController } from "./cancel-subscription.controller";
import { RecordUsageController } from "./record-usage.controller";
import { CheckQuotaController } from "./check-quota.controller";
import { AdminGetSubscriptionsController } from "./admin-get-subscriptions.controller";
import { AdminGetSubscriptionDetailController } from "./admin-get-subscription-detail.controller";
import { AdminCancelSubscriptionController } from "./admin-cancel-subscription.controller";
import { AdminRefundSubscriptionController } from "./admin-refund-subscription.controller";
import { AdminExtendSubscriptionController } from "./admin-extend-subscription.controller";
import { AdminChangeSubscriptionPlanController } from "./admin-change-plan.controller";

export class SubscriptionController {
  private readonly getMySubscriptionController: GetMySubscriptionController;
  private readonly subscribePlanController: SubscribePlanController;
  private readonly createRazorpayOrderController: CreateRazorpayOrderController;
  private readonly verifyRazorpayPaymentController: VerifyRazorpayPaymentController;
  private readonly getInvoicesController: GetInvoicesController;
  private readonly cancelSubscriptionController: CancelSubscriptionController;
  private readonly recordUsageController: RecordUsageController;
  private readonly checkQuotaController: CheckQuotaController;
  private readonly adminGetSubscriptionsController: AdminGetSubscriptionsController;
  private readonly adminGetSubscriptionDetailController: AdminGetSubscriptionDetailController;
  private readonly adminCancelSubscriptionController: AdminCancelSubscriptionController;
  private readonly adminRefundSubscriptionController: AdminRefundSubscriptionController;
  private readonly adminExtendSubscriptionController: AdminExtendSubscriptionController;
  private readonly adminChangeSubscriptionPlanController: AdminChangeSubscriptionPlanController;

  constructor(
    private readonly getTeacherSubscriptionUseCase: GetTeacherSubscriptionUseCase,
    private readonly subscribePlanUseCase: SubscribePlanUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly recordUsageUseCase: RecordUsageUseCase,
    private readonly checkQuotaUseCase: CheckQuotaUseCase,
    private readonly createRazorpayOrderUseCase: CreateRazorpayOrderUseCase,
    private readonly verifyRazorpayPaymentUseCase: VerifyRazorpayPaymentUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly adminGetSubscriptionsUseCase: AdminGetSubscriptionsUseCase,
    private readonly adminGetSubscriptionDetailUseCase: AdminGetSubscriptionDetailUseCase,
    private readonly adminCancelSubscriptionUseCase: AdminCancelSubscriptionUseCase,
    private readonly adminRefundSubscriptionUseCase: AdminRefundSubscriptionUseCase,
    private readonly adminExtendSubscriptionUseCase: AdminExtendSubscriptionUseCase,
    private readonly adminChangeSubscriptionPlanUseCase: AdminChangeSubscriptionPlanUseCase
  ) {
    this.getMySubscriptionController = new GetMySubscriptionController(this.getTeacherSubscriptionUseCase);
    this.subscribePlanController = new SubscribePlanController(this.subscribePlanUseCase);
    this.createRazorpayOrderController = new CreateRazorpayOrderController(this.createRazorpayOrderUseCase);
    this.verifyRazorpayPaymentController = new VerifyRazorpayPaymentController(this.verifyRazorpayPaymentUseCase);
    this.getInvoicesController = new GetInvoicesController(this.getInvoicesUseCase);
    this.cancelSubscriptionController = new CancelSubscriptionController(this.cancelSubscriptionUseCase);
    this.recordUsageController = new RecordUsageController(this.recordUsageUseCase);
    this.checkQuotaController = new CheckQuotaController(this.checkQuotaUseCase);
    this.adminGetSubscriptionsController = new AdminGetSubscriptionsController(this.adminGetSubscriptionsUseCase);
    this.adminGetSubscriptionDetailController = new AdminGetSubscriptionDetailController(this.adminGetSubscriptionDetailUseCase);
    this.adminCancelSubscriptionController = new AdminCancelSubscriptionController(this.adminCancelSubscriptionUseCase);
    this.adminRefundSubscriptionController = new AdminRefundSubscriptionController(this.adminRefundSubscriptionUseCase);
    this.adminExtendSubscriptionController = new AdminExtendSubscriptionController(this.adminExtendSubscriptionUseCase);
    this.adminChangeSubscriptionPlanController = new AdminChangeSubscriptionPlanController(this.adminChangeSubscriptionPlanUseCase);
  }

  getMySubscription = (req: Request, res: Response, next: NextFunction) =>
    this.getMySubscriptionController.execute(req, res, next);

  subscribe = (req: Request, res: Response, next: NextFunction) =>
    this.subscribePlanController.execute(req, res, next);

  createRazorpayOrder = (req: Request, res: Response, next: NextFunction) =>
    this.createRazorpayOrderController.execute(req, res, next);

  verifyRazorpayPayment = (req: Request, res: Response, next: NextFunction) =>
    this.verifyRazorpayPaymentController.execute(req, res, next);

  getInvoices = (req: Request, res: Response, next: NextFunction) =>
    this.getInvoicesController.execute(req, res, next);

  cancelSubscription = (req: Request, res: Response, next: NextFunction) =>
    this.cancelSubscriptionController.execute(req, res, next);

  recordUsage = (req: Request, res: Response, next: NextFunction) =>
    this.recordUsageController.execute(req, res, next);

  checkQuota = (req: Request, res: Response, next: NextFunction) =>
    this.checkQuotaController.execute(req, res, next);

  adminGetSubscriptions = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetSubscriptionsController.execute(req, res, next);

  adminGetSubscriptionDetail = (req: Request, res: Response, next: NextFunction) =>
    this.adminGetSubscriptionDetailController.execute(req, res, next);

  adminCancelSubscription = (req: Request, res: Response, next: NextFunction) =>
    this.adminCancelSubscriptionController.execute(req, res, next);

  adminRefundSubscription = (req: Request, res: Response, next: NextFunction) =>
    this.adminRefundSubscriptionController.execute(req, res, next);

  adminExtendSubscription = (req: Request, res: Response, next: NextFunction) =>
    this.adminExtendSubscriptionController.execute(req, res, next);

  adminChangeSubscriptionPlan = (req: Request, res: Response, next: NextFunction) =>
    this.adminChangeSubscriptionPlanController.execute(req, res, next);
}
