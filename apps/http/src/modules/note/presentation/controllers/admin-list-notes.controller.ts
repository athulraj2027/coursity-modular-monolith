import { Request, Response, NextFunction } from "express";
import { AdminListNotesUseCase } from "../../application/use-cases/admin-list-notes.usecase";
import { ApiResponse } from "@/shared";

export class AdminListNotesController {
  constructor(private readonly adminListNotesUseCase: AdminListNotesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminListNotesUseCase.execute(req.query as any);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
