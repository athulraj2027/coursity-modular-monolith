import { Request, Response, NextFunction } from "express";
import { GetNotesByCourseUseCase } from "../../application/use-cases/get-notes-by-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetNotesByCourseController {
  constructor(private readonly getNotesByCourseUseCase: GetNotesByCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const courseId = req.params.courseId as string;
      const result = await this.getNotesByCourseUseCase.execute({
        courseId,
        userId: req.user.userId,
        userRole: req.user.role,
      });
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
