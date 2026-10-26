import { Request, Response, NextFunction } from "express";
import { VerifyTopUpPaymentUseCase } from "../../application/use-cases/verify-topup-payment.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class VerifyTopUpPaymentController {
  constructor(private readonly verifyTopUpPaymentUseCase: VerifyTopUpPaymentUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const transaction = await this.verifyTopUpPaymentUseCase.execute({
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });
      return ApiResponse.success(res, transaction, "Wallet top-up successful");
    } catch (error) {
      next(error);
    }
  };
}
