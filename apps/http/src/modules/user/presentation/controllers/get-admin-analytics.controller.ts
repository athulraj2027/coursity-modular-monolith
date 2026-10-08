import { NextFunction, Request, Response } from "express";
import { GetAdminAnalytics } from "../../application/use-cases/get-admin-analytics.usecase";
import { STATUS_CODES } from "@/app/config/status";

export class GetAdminAnalyticsController {
  constructor(private readonly getAdminAnalytics: GetAdminAnalytics) {}

  execute = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.getAdminAnalytics.execute();
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: "Admin analytics metrics retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
