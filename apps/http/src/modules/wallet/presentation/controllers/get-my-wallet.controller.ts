import { Request, Response, NextFunction } from "express";
import { GetOrCreateWalletUseCase } from "../../application/use-cases/get-or-create-wallet.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMyWalletController {
  constructor(private readonly getOrCreateWalletUseCase: GetOrCreateWalletUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const wallet = await this.getOrCreateWalletUseCase.execute(userId);
      return ApiResponse.success(res, wallet);
    } catch (error) {
      next(error);
    }
  };
}
