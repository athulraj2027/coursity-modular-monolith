import { Request, Response, NextFunction } from "express";
import { GetActiveOffersUseCase } from "../../application/use-cases/get-active-offers.usecase";
import { ApiResponse } from "@/shared";

export class GetActiveOffersController {
  constructor(private readonly getActiveOffersUseCase: GetActiveOffersUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, billingCycle } = req.query as { planId?: string; billingCycle?: string };
      const offers = await this.getActiveOffersUseCase.execute(planId, billingCycle);
      return ApiResponse.success(res, offers);
    } catch (error) {
      next(error);
    }
  };
}
