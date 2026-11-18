import { Request, Response, NextFunction } from "express";
import { AdminListNotesUseCase } from "../../application/use-cases/admin-list-notes.usecase";
import { ApiResponse } from "@/shared";
import { noteQueryObjectSchema } from "../schemas/note.schema";

export class AdminListNotesController {
  constructor(private readonly adminListNotesUseCase: AdminListNotesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = noteQueryObjectSchema.parse(req.query);
      const result = await this.adminListNotesUseCase.execute(validatedQuery);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
