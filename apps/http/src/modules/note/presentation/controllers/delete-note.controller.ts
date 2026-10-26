import { Request, Response, NextFunction } from "express";
import { DeleteNoteUseCase } from "../../application/use-cases/delete-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class DeleteNoteController {
  constructor(private readonly deleteNoteUseCase: DeleteNoteUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const noteId = req.params.id as string;
      await this.deleteNoteUseCase.execute({
        noteId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, undefined, "Note deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
