import { Request, Response, NextFunction } from "express";
import { AdminGetAllPlansUseCase } from "../../application/use-cases/admin-get-all-plans.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetAllPlansController {
  private readonly adminGetAllPlansUseCase: AdminGetAllPlansUseCase;

  constructor(useCaseOrFacade: AdminGetAllPlansUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.adminGetAllPlansUseCase = useCaseOrFacade as AdminGetAllPlansUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.adminGetAllPlansUseCase = {
        execute: async () => facade.getAllPlans(),
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const plans = await this.adminGetAllPlansUseCase.execute();
      return ApiResponse.success(res, plans);
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
