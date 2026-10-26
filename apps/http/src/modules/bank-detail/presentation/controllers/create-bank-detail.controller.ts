import { Request, Response, NextFunction } from "express";
import { CreateBankDetailUseCase } from "../../application/use-cases/create-bank-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateBankDetailController {
  constructor(private readonly createBankDetailUseCase: CreateBankDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const result = await this.createBankDetailUseCase.execute({
        ...req.body,
        userId,
      });

      return ApiResponse.created(res, result, "Bank details saved successfully");
    } catch (error) {
      next(error);
    }
  };
}
