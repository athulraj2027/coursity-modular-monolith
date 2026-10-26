import { Request, Response, NextFunction } from "express";
import { AdminGetAllWalletsUseCase } from "../../application/use-cases/admin-get-all-wallets.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetAllWalletsController {
  constructor(private readonly adminGetAllWalletsUseCase: AdminGetAllWalletsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status } = req.query as any;
      const result = await this.adminGetAllWalletsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
        search: search ? String(search) : undefined,
        status,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
