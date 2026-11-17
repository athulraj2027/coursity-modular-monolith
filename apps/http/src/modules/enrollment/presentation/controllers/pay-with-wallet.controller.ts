import { Request, Response, NextFunction } from "express";
import { PayWithWalletUseCase } from "../../application/use-cases/pay-with-wallet.usecase";
import { payWithWalletSchema } from "../schemas/enrollment.schema";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class PayWithWalletController {
  constructor(private readonly payWithWalletUseCase: PayWithWalletUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const validated = payWithWalletSchema.parse(req.body);
      const result = await this.payWithWalletUseCase.execute(studentId, validated);
      return ApiResponse.created(res, result, "Enrollment completed via wallet payment.");
    } catch (error) {
      next(error);
    }
  };
}
