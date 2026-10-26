import { Request, Response, NextFunction } from "express";
import { GetNoteDetailUseCase } from "../../application/use-cases/get-note-detail.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetNoteDetailController {
  constructor(private readonly getNoteDetailUseCase: GetNoteDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      const result = await this.getNoteDetailUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
