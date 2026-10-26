import { Request, Response, NextFunction } from "express";
import { SetPrimaryBankDetailUseCase } from "../../application/use-cases/set-primary-bank-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class SetPrimaryBankDetailController {
  constructor(private readonly setPrimaryBankDetailUseCase: SetPrimaryBankDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const id = String(req.params.id);
      const result = await this.setPrimaryBankDetailUseCase.execute(id, userId);

      return ApiResponse.success(res, result, "Primary payout account updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
