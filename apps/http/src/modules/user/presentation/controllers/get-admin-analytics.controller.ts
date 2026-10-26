import { NextFunction, Request, Response } from "express";
import { GetAdminAnalytics } from "../../application/use-cases/get-admin-analytics.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetAdminAnalyticsController {
  constructor(private readonly getAdminAnalytics: GetAdminAnalytics) {}

  execute = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.getAdminAnalytics.execute();
      return ApiResponse.success(
        res,
        data,
        "Admin analytics metrics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}
