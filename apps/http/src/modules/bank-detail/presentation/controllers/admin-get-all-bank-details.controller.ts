import { Request, Response, NextFunction } from "express";
import { AdminGetAllBankDetailsUseCase } from "../../application/use-cases/admin-get-all-bank-details.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetAllBankDetailsController {
  constructor(private readonly adminGetAllBankDetailsUseCase: AdminGetAllBankDetailsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status, methodType, userId } = req.query as any;

      const result = await this.adminGetAllBankDetailsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search: search ? String(search) : undefined,
        status: status as any,
        methodType: methodType as any,
        userId: userId ? String(userId) : undefined,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
