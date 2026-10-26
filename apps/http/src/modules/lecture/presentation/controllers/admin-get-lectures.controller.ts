import { Request, Response, NextFunction } from "express";
import { AdminGetLecturesUseCase } from "../../application/use-cases/admin-get-lectures.usecase";
import { ApiResponse } from "@/shared";

export class AdminGetLecturesController {
  constructor(private readonly adminGetLecturesUseCase: AdminGetLecturesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminGetLecturesUseCase.execute(req.query as any);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
