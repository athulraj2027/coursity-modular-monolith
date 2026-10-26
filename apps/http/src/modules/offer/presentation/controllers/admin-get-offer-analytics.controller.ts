import { Request, Response, NextFunction } from "express";
import { AdminGetOfferAnalyticsUseCase } from "../../application/use-cases/admin-get-offer-analytics.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetOfferAnalyticsController {
  constructor(private readonly adminGetOfferAnalyticsUseCase: AdminGetOfferAnalyticsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const analytics = await this.adminGetOfferAnalyticsUseCase.execute();
      return ApiResponse.success(res, analytics);
    } catch (error) {
      next(error);
    }
  };
}
