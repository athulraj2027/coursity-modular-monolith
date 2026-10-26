import { Request, Response, NextFunction } from "express";
import { RequestPayoutUseCase } from "../../application/use-cases/request-payout.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class RequestPayoutController {
  constructor(private readonly requestPayoutUseCase: RequestPayoutUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { amount, bankDetailId } = req.body;
      const payout = await this.requestPayoutUseCase.execute({
        userId,
        amount: Number(amount),
        bankDetailId,
      });
      return ApiResponse.created(res, payout, "Payout request submitted successfully");
    } catch (error) {
      next(error);
    }
  };
}
