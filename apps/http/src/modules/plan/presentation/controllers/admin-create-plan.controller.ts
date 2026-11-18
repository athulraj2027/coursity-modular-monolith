import { Request, Response, NextFunction } from "express";
import { AdminCreatePlanUseCase } from "../../application/use-cases/admin-create-plan.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { createPlanSchema } from "../schemas/plan.schema";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminCreatePlanController {
  private readonly adminCreatePlanUseCase: AdminCreatePlanUseCase;

  constructor(useCaseOrFacade: AdminCreatePlanUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.adminCreatePlanUseCase = useCaseOrFacade as AdminCreatePlanUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.adminCreatePlanUseCase = {
        execute: async (dto: any) => facade.createPlan(dto),
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const validated = createPlanSchema.parse(req.body);
      const plan = await this.adminCreatePlanUseCase.execute(validated as any);
      return ApiResponse.created(res, plan, "Subscription plan created successfully");
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
