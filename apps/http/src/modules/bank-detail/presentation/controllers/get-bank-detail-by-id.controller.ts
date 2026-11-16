import { Request, Response, NextFunction } from "express";
import { GetBankDetailByIdUseCase } from "../../application/use-cases/get-bank-detail-by-id.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetBankDetailByIdController {
  constructor(private readonly getBankDetailByIdUseCase: GetBankDetailByIdUseCase) { }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const id = String(req.params.id);
      const result = await this.getBankDetailByIdUseCase.execute(id, userId);

      return ApiResponse.success(res, result, "Bank details retrieved successfully");
    } catch (error) {
      next(error);
    }
  };
}

