import { Request, Response, NextFunction } from "express";
import { AdminUpdateBankVerificationUseCase } from "../../application/use-cases/admin-update-bank-verification.usecase";
import { ApiResponse } from "@/shared";

export class AdminUpdateBankVerificationController {
  constructor(private readonly adminUpdateBankVerificationUseCase: AdminUpdateBankVerificationUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;

      const result = await this.adminUpdateBankVerificationUseCase.execute({
        id,
        status,
        notes,
      });

      return ApiResponse.success(
        res,
        result,
        `Bank account verification status updated to ${status}`
      );
    } catch (error) {
      next(error);
    }
  };
}
