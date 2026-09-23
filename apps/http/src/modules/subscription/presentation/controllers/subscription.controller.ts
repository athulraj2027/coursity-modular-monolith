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
import {
  subscribePlanSchema,
  recordUsageSchema,
  checkQuotaQuerySchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  adminSubscriptionQuerySchema,
  adminCancelSubscriptionSchema,
  adminRefundSubscriptionSchema,
  adminExtendSubscriptionSchema,
  adminChangeSubscriptionPlanSchema,
} from "../validators/subscription.validator";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class SubscriptionController {
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
  ) {}

  private async getTeacherProfileId(userId: string): Promise<string> {
    let profile = await defaultPrisma.profile.findUnique({
      where: { userId },
      include: { teacherProfile: true },
    });

    if (!profile) {
      profile = await defaultPrisma.profile.create({
        data: {
          userId,
          teacherProfile: {
            create: {},
          },
        },
        include: { teacherProfile: true },
      });
    } else if (!profile.teacherProfile) {
      const teacherProfile = await defaultPrisma.teacherProfile.create({
        data: {
          profileId: profile.id,
        },
      });
      return teacherProfile.id;
    }

    if (!profile.teacherProfile) {
      throw new BadRequestError("Unable to locate or create instructor profile");
    }

    return profile.teacherProfile.id;
  }

  // GET /api/subscriptions/my-subscription (Protected - Teacher)
  getMySubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const details = await this.getTeacherSubscriptionUseCase.execute(teacherProfileId);

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/subscribe (Protected - Teacher)
  subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = subscribePlanSchema.parse(req.body);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const subscription = await this.subscribePlanUseCase.execute({
        planId: validated.planId,
        teacherProfileId,
        paymentMethod: validated.paymentMethod,
        externalCustomerId: validated.externalCustomerId,
        externalSubscriptionId: validated.externalSubscriptionId,
      });

      res.status(200).json({
        success: true,
        message: "Successfully subscribed to plan",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/razorpay/order (Protected - Teacher)
  createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = createRazorpayOrderSchema.parse(req.body);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const result = await this.createRazorpayOrderUseCase.execute({
        planId: validated.planId,
        teacherProfileId,
        userEmail: req.user.email,
        userName: (req.user as any).name || "Instructor",
        billingCycle: validated.billingCycle,
        offerId: validated.offerId,
        phone: validated.phone,
        state: validated.state,
        country: validated.country,
        gstin: validated.gstin,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/razorpay/verify (Protected - Teacher)
  verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = verifyRazorpayPaymentSchema.parse(req.body);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const result = await this.verifyRazorpayPaymentUseCase.execute({
        orderId: validated.orderId,
        paymentId: validated.paymentId,
        signature: validated.signature,
        planId: validated.planId,
        teacherProfileId,
        userEmail: req.user.email,
        userName: (req.user as any).name || "Instructor",
        billingCycle: validated.billingCycle,
        offerId: validated.offerId,
        phone: validated.phone,
        state: validated.state,
        country: validated.country,
        gstin: validated.gstin,
      });

      res.status(200).json({
        success: true,
        message: "Payment verified and subscription activated successfully!",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/subscriptions/invoices (Protected - Teacher)
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const invoices = await this.getInvoicesUseCase.execute(teacherProfileId);

      res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/cancel (Protected - Teacher)
  cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const immediate = req.body?.immediate === true;

      const subscription = await this.cancelSubscriptionUseCase.execute(
        teacherProfileId,
        immediate
      );

      res.status(200).json({
        success: true,
        message: immediate
          ? "Subscription cancelled immediately"
          : "Subscription will cancel at the end of current period",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/usage/record (Internal / Protected)
  recordUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = recordUsageSchema.parse(req.body);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const usage = await this.recordUsageUseCase.execute(
        teacherProfileId,
        validated.featureCode,
        validated.incrementBy || validated.setAbsoluteValue || 1,
        validated.setAbsoluteValue !== undefined
      );

      res.status(200).json({
        success: true,
        data: usage,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/subscriptions/quota/check (Internal / Protected)
  checkQuota = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = checkQuotaQuerySchema.parse(req.query);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const evaluation = await this.checkQuotaUseCase.execute(
        teacherProfileId,
        validated.featureCode,
        validated.amount
      );

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // ADMIN SUBSCRIPTION MANAGEMENT HANDLERS
  // ==========================================

  // GET /api/subscriptions/admin/subscriptions
  adminGetSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const query = adminSubscriptionQuerySchema.parse(req.query);
      const result = await this.adminGetSubscriptionsUseCase.execute(query as any);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/subscriptions/admin/subscriptions/:id
  adminGetSubscriptionDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const detail = await this.adminGetSubscriptionDetailUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/admin/subscriptions/:id/cancel
  adminCancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const body = adminCancelSubscriptionSchema.parse(req.body);

      const updated = await this.adminCancelSubscriptionUseCase.execute({
        subscriptionId: id,
        immediate: body.immediate,
        reason: body.reason,
      });

      res.status(200).json({
        success: true,
        message: body.immediate
          ? "Subscription revoked immediately"
          : "Subscription scheduled for cancellation at period end",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/admin/subscriptions/:id/refund
  adminRefundSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const body = adminRefundSubscriptionSchema.parse(req.body);

      const result = await this.adminRefundSubscriptionUseCase.execute({
        subscriptionId: id,
        invoiceId: body.invoiceId,
        amount: body.amount,
        reason: body.reason,
        cancelSubscriptionImmediately: body.cancelSubscriptionImmediately,
      });

      res.status(200).json({
        success: true,
        message: "Refund processed successfully via Razorpay",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/admin/subscriptions/:id/extend
  adminExtendSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const body = adminExtendSubscriptionSchema.parse(req.body);

      const updated = await this.adminExtendSubscriptionUseCase.execute({
        subscriptionId: id,
        daysToAdd: body.daysToAdd,
        newPeriodEnd: body.newPeriodEnd ? new Date(body.newPeriodEnd) : undefined,
        reason: body.reason,
      });

      res.status(200).json({
        success: true,
        message: "Subscription period extended successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/subscriptions/admin/subscriptions/:id/change-plan
  adminChangeSubscriptionPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const body = adminChangeSubscriptionPlanSchema.parse(req.body);

      const updated = await this.adminChangeSubscriptionPlanUseCase.execute({
        subscriptionId: id,
        newPlanId: body.newPlanId,
        resetPeriod: body.resetPeriod,
      });

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  private assertAdmin(req: Request) {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    const role = (req.user.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      throw new ForbiddenError("Administrative privileges required");
    }
  }
}
