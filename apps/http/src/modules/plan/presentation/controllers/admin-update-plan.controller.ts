import { Request, Response, NextFunction } from "express";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { updatePlanSchema } from "../validators/plan.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminUpdatePlanController {
  constructor(private readonly adminManagePlansUseCase: AdminManagePlansUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const validated = updatePlanSchema.parse(req.body);
      const plan = await this.adminManagePlansUseCase.updatePlan(id, validated as any);
      return ApiResponse.success(res, plan, "Subscription plan updated successfully");
    } catch (error) {
      next(error);
    }
  };

  private assertAdmin(req: Request) {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const role = (req.user.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      throw new ForbiddenError("Administrative privileges required");
    }
  }
}
