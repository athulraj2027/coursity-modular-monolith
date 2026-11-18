import { Request, Response, NextFunction } from "express";
import { AdminGetAllFeaturesUseCase } from "../../application/use-cases/admin-get-all-features.usecase";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetAllFeaturesController {
  private readonly adminGetAllFeaturesUseCase: AdminGetAllFeaturesUseCase;

  constructor(useCaseOrFacade: AdminGetAllFeaturesUseCase | AdminManagePlansUseCase) {
    if ("execute" in useCaseOrFacade && typeof useCaseOrFacade.execute === "function") {
      this.adminGetAllFeaturesUseCase = useCaseOrFacade as AdminGetAllFeaturesUseCase;
    } else {
      const facade = useCaseOrFacade as AdminManagePlansUseCase;
      this.adminGetAllFeaturesUseCase = {
        execute: async () => facade.getAllFeatures(),
      } as any;
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const features = await this.adminGetAllFeaturesUseCase.execute();
      return ApiResponse.success(res, features);
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
