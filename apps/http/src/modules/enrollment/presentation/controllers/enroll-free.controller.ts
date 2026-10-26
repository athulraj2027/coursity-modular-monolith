import { Request, Response, NextFunction } from "express";
import { EnrollFreeCourseUseCase } from "../../application/use-cases/enroll-free-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class EnrollFreeController {
  constructor(private readonly enrollFreeUseCase: EnrollFreeCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const { courseId } = req.body;
      const result = await this.enrollFreeUseCase.execute(studentId, courseId);
      return ApiResponse.created(res, result, "Enrolled in course successfully.");
    } catch (error) {
      next(error);
    }
  };
}
