import { Request, Response, NextFunction } from "express";
import { AdminUpdatePlanUseCase } from "../../application/use-cases/admin-update-plan.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { updatePlanSchema } from "../schemas/plan.schema";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminUpdatePlanController {
  private readonly adminUpdatePlanUseCase: AdminUpdatePlanUseCase;

  constructor(useCaseOrFacade: AdminUpdatePlanUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.adminUpdatePlanUseCase = useCaseOrFacade as AdminUpdatePlanUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.adminUpdatePlanUseCase = {
        execute: async (id: string, dto: any) => facade.updatePlan(id, dto),
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const validated = updatePlanSchema.parse(req.body);
      const plan = await this.adminUpdatePlanUseCase.execute(id, validated as any);
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
