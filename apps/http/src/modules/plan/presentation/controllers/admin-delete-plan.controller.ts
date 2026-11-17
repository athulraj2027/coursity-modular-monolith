import { Request, Response, NextFunction } from "express";
import { AdminDeletePlanUseCase } from "../../application/use-cases/admin-delete-plan.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminDeletePlanController {
  private readonly adminDeletePlanUseCase: AdminDeletePlanUseCase;

  constructor(useCaseOrFacade: AdminDeletePlanUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.adminDeletePlanUseCase = useCaseOrFacade as AdminDeletePlanUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.adminDeletePlanUseCase = {
        execute: async (id: string) => facade.deletePlan(id),
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      await this.adminDeletePlanUseCase.execute(id);
      return ApiResponse.success(res, { success: true }, "Subscription plan deleted successfully");
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
