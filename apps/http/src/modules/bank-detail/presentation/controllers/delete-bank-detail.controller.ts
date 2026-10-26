import { Request, Response, NextFunction } from "express";
import { DeleteBankDetailUseCase } from "../../application/use-cases/delete-bank-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class DeleteBankDetailController {
  constructor(private readonly deleteBankDetailUseCase: DeleteBankDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const id = String(req.params.id);
      const result = await this.deleteBankDetailUseCase.execute(id, userId);

      return ApiResponse.success(res, result, "Bank account removed successfully");
    } catch (error) {
      next(error);
    }
  };
}
