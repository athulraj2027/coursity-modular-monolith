import { Request, Response, NextFunction } from "express";
import { UpdateNoteUseCase } from "../../application/use-cases/update-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class UpdateNoteController {
  constructor(private readonly updateNoteUseCase: UpdateNoteUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      const result = await this.updateNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return ApiResponse.success(res, result, "Note updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
