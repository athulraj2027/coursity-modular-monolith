import { Request, Response, NextFunction } from "express";
import { UpdateLessonProgressUseCase } from "../../application/use-cases/update-lesson-progress.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class UpdateProgressController {
  constructor(private readonly updateProgressUseCase: UpdateLessonProgressUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;
      const result = await this.updateProgressUseCase.execute(studentId, {
        enrollmentId,
        ...req.body,
      });
      return ApiResponse.success(res, result, "Learning progress updated.");
    } catch (error) {
      next(error);
    }
  };
}
