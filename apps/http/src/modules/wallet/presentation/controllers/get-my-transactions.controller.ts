import { Request, Response, NextFunction } from "express";
import { GetWalletTransactionsUseCase } from "../../application/use-cases/get-wallet-transactions.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMyTransactionsController {
  constructor(private readonly getWalletTransactionsUseCase: GetWalletTransactionsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { page, limit, type } = req.query as any;
      const transactions = await this.getWalletTransactionsUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        type: type as any,
      });
      return ApiResponse.success(res, transactions);
    } catch (error) {
      next(error);
    }
  };
}
