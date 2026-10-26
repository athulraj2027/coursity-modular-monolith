import { Request, Response, NextFunction } from "express";
import { PayWithWalletUseCase } from "../../application/use-cases/pay-with-wallet.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class PayWithWalletController {
  constructor(private readonly payWithWalletUseCase: PayWithWalletUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const result = await this.payWithWalletUseCase.execute(studentId, req.body);
      return ApiResponse.created(res, result, "Enrollment completed using wallet balance.");
    } catch (error) {
      next(error);
    }
  };
}
