import { Request, Response, NextFunction } from "express";
import { AdminGetAllPayoutsUseCase } from "../../application/use-cases/admin-get-all-payouts.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetAllPayoutsController {
  constructor(private readonly adminGetAllPayoutsUseCase: AdminGetAllPayoutsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status, search } = req.query as any;
      const result = await this.adminGetAllPayoutsUseCase.execute({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
        status: status as any,
        search: search ? String(search) : undefined,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
