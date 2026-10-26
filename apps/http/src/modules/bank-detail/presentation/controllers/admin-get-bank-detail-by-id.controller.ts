import { Request, Response, NextFunction } from "express";
import { AdminGetBankDetailByIdUseCase } from "../../application/use-cases/admin-get-bank-detail-by-id.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetBankDetailByIdController {
  constructor(private readonly adminGetBankDetailByIdUseCase: AdminGetBankDetailByIdUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const result = await this.adminGetBankDetailByIdUseCase.execute(id);

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
