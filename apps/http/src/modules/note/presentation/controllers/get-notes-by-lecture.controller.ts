import { Request, Response, NextFunction } from "express";
import { GetNotesByLectureUseCase } from "../../application/use-cases/get-notes-by-lecture.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetNotesByLectureController {
  constructor(private readonly getNotesByLectureUseCase: GetNotesByLectureUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const lectureId = req.params.lectureId as string;
      const result = await this.getNotesByLectureUseCase.execute({
        lectureId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
