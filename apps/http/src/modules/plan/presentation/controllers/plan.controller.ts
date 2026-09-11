import { Request, Response, NextFunction } from "express";
import { GetPlansUseCase } from "../../application/use-cases/get-plans.usecase";
import { GetTeacherSubscriptionUseCase } from "../../application/use-cases/get-teacher-subscription.usecase";
import { SubscribePlanUseCase } from "../../application/use-cases/subscribe-plan.usecase";
import { CancelSubscriptionUseCase } from "../../application/use-cases/cancel-subscription.usecase";
import { RecordUsageUseCase } from "../../application/use-cases/record-usage.usecase";
import { CheckQuotaUseCase } from "../../application/use-cases/check-quota.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import {
  createPlanSchema,
  updatePlanSchema,
  subscribePlanSchema,
  recordUsageSchema,
  checkQuotaQuerySchema,
} from "../validators/plan.validator";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/app/errors";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class PlanController {
  constructor(
    private readonly getPlansUseCase: GetPlansUseCase,
    private readonly getTeacherSubscriptionUseCase: GetTeacherSubscriptionUseCase,
    private readonly subscribePlanUseCase: SubscribePlanUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly recordUsageUseCase: RecordUsageUseCase,
    private readonly checkQuotaUseCase: CheckQuotaUseCase,
    private readonly adminManagePlansUseCase: AdminManagePlansUseCase
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

  // GET /api/plans (Public / Authenticated)
  getPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getPlansUseCase.execute(false);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/plans/my-subscription (Protected - Teacher)
  getMySubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);
      const result = await this.getTeacherSubscriptionUseCase.execute(teacherProfileId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/plans/subscribe (Protected - Teacher)
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

  // POST /api/plans/cancel (Protected - Teacher)
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
          : "Subscription will cancel at the end of current billing period",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/plans/check-quota (Protected - Teacher)
  checkQuota = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = checkQuotaQuerySchema.parse(req.query);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const result = await this.checkQuotaUseCase.execute({
        teacherProfileId,
        featureCode: validated.featureCode,
        requiredAmount: validated.amount,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/plans/record-usage (Protected - Internal / Teacher)
  recordUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const validated = recordUsageSchema.parse(req.body);
      const teacherProfileId = await this.getTeacherProfileId(req.user.userId);

      const result = await this.recordUsageUseCase.execute({
        teacherProfileId,
        featureCode: validated.featureCode,
        incrementBy: validated.incrementBy,
        setAbsoluteValue: validated.setAbsoluteValue,
      });

      res.status(200).json({
        success: true,
        message: "Usage recorded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ================= ADMIN CONTROLLERS =================

  // GET /api/plans/admin/all (Protected - Admin)
  adminGetAllPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const plans = await this.adminManagePlansUseCase.getAllPlans();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/plans/admin/features (Protected - Admin)
  adminGetAllFeatures = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const features = await this.adminManagePlansUseCase.getAllFeatures();
      res.status(200).json({
        success: true,
        data: features,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/plans/admin/:id (Protected - Admin)
  adminGetPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const plan = await this.adminManagePlansUseCase.getPlanById(id);
      if (!plan) {
        throw new NotFoundError(`Plan with id '${id}' not found`);
      }
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/plans/admin (Protected - Admin)
  adminCreatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const validated = createPlanSchema.parse(req.body);
      const plan = await this.adminManagePlansUseCase.createPlan(validated as any);

      res.status(201).json({
        success: true,
        message: "Plan created successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/plans/admin/:id (Protected - Admin)
  adminUpdatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = updatePlanSchema.parse(req.body);
      const plan = await this.adminManagePlansUseCase.updatePlan(id, validated as any);

      res.status(200).json({
        success: true,
        message: "Plan updated successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/plans/admin/:id (Protected - Admin)
  adminDeletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.ensureAdmin(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const success = await this.adminManagePlansUseCase.deletePlan(id);

      if (!success) {
        throw new BadRequestError("Failed to delete plan. Plan may not exist.");
      }

      res.status(200).json({
        success: true,
        message: "Plan deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  private ensureAdmin(req: Request) {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new ForbiddenError("Admin privileges required to manage subscription plans.");
    }
  }
}
