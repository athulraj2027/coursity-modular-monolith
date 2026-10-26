import { Request, Response, NextFunction } from "express";
import { GetUserBankDetailsUseCase } from "../../application/use-cases/get-user-bank-details.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMyBankDetailsController {
  constructor(private readonly getUserBankDetailsUseCase: GetUserBankDetailsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const items = await this.getUserBankDetailsUseCase.execute(userId);

      return ApiResponse.success(res, items);
    } catch (error) {
      next(error);
    }
  };
}
