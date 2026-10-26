import { Request, Response, NextFunction } from "express";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetAllFeaturesController {
  constructor(private readonly adminManagePlansUseCase: AdminManagePlansUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const features = await this.adminManagePlansUseCase.getAllFeatures();
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
