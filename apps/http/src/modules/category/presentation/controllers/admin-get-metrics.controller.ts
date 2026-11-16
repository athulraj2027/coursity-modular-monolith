import { Request, Response, NextFunction } from "express";
import { AdminGetMetricsUseCase } from "../../application/use-cases/admin-get-metrics.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetMetricsController {
  constructor(
    private readonly useCase: AdminGetMetricsUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const metrics = "getMetrics" in this.useCase
        ? await this.useCase.getMetrics()
        : await this.useCase.execute();

      return ApiResponse.success(res, metrics);
    } catch (error) {
      next(error);
    }
  };
}
