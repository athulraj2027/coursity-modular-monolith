import { Request, Response, NextFunction } from "express";
import { CreateNoteUseCase } from "../../application/use-cases/create-note.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateNoteController {
  constructor(private readonly createNoteUseCase: CreateNoteUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const result = await this.createNoteUseCase.execute({
        userId: req.user.userId,
        userRole: req.user.role,
        data: req.body,
      });
      return ApiResponse.created(res, result, "Note uploaded and created successfully");
    } catch (error) {
      next(error);
    }
  };
}
