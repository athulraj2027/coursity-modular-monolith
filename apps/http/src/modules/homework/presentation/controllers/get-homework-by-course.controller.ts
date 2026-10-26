import { Request, Response, NextFunction } from "express";
import { GetHomeworkByCourseUseCase } from "../../application/use-cases/get-homework-by-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetHomeworkByCourseController {
  constructor(private readonly getHomeworkByCourseUseCase: GetHomeworkByCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const courseId = req.params.courseId as string;
      const result = await this.getHomeworkByCourseUseCase.execute({
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
