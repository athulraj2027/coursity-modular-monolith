import { Request, Response, NextFunction } from "express";
import { GetPlanByIdUseCase } from "../../application/use-cases/get-plan-by-id.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetPlanByIdController {
  private readonly getPlanByIdUseCase: GetPlanByIdUseCase;

  constructor(useCaseOrFacade: GetPlanByIdUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.getPlanByIdUseCase = useCaseOrFacade as GetPlanByIdUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.getPlanByIdUseCase = {
        execute: async (id: string) => {
          const plan = await facade.getPlanById(id);
          if (!plan) throw new Error(`Plan with id '${id}' not found`);
          return plan;
        },
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const plan = await this.getPlanByIdUseCase.execute(id);
      return ApiResponse.success(res, plan);
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
