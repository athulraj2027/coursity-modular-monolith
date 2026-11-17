import { Request, Response, NextFunction } from "express";
import { UpdateLessonProgressUseCase } from "../../application/use-cases/update-lesson-progress.usecase";
import { updateLessonProgressSchema } from "../schemas/enrollment.schema";
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

      const validated = updateLessonProgressSchema.parse(req.body);

      const result = await this.updateProgressUseCase.execute(studentId, {
        enrollmentId,
        ...validated,
      });
      return ApiResponse.success(res, result, "Progress updated.");
    } catch (error) {
      next(error);
    }
  };
}
