import { Request, Response, NextFunction } from "express";
import { GetPlansUseCase } from "../../application/use-cases/get-plans.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../validators/plan.validator";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/app/errors";

export class PlanController {
  constructor(
    private readonly getPlansUseCase: GetPlansUseCase,
    private readonly adminManagePlansUseCase: AdminManagePlansUseCase
  ) {}

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

  // GET /api/plans/:id (Public / Authenticated)
  getPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
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

  // ==========================================
  // ADMIN PLAN & FEATURE MANAGEMENT HANDLERS
  // ==========================================

  // GET /api/plans/admin/all (Protected - Admin)
  adminGetAllPlans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
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
      this.assertAdmin(req);
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
      this.assertAdmin(req);
      const id = req.params.id as string;
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
      this.assertAdmin(req);
      const validated = createPlanSchema.parse(req.body);
      const plan = await this.adminManagePlansUseCase.createPlan(validated as any);

      res.status(201).json({
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/plans/admin/:id (Protected - Admin)
  adminUpdatePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const validated = updatePlanSchema.parse(req.body);
      const plan = await this.adminManagePlansUseCase.updatePlan(id, validated as any);

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/plans/admin/:id (Protected - Admin)
  adminDeletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      await this.adminManagePlansUseCase.deletePlan(id);

      res.status(200).json({
        success: true,
        message: "Subscription plan deactivated/deleted successfully",
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
