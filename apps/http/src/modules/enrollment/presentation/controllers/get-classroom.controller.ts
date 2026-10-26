import { Request, Response, NextFunction } from "express";
import { GetCourseClassroomUseCase } from "../../application/use-cases/get-course-classroom.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetClassroomController {
  constructor(private readonly getClassroomUseCase: GetCourseClassroomUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) throw new UnauthorizedError("Authentication required.");

      const courseIdOrSlug = Array.isArray(req.params.courseIdOrSlug)
        ? req.params.courseIdOrSlug[0]
        : req.params.courseIdOrSlug;
      const result = await this.getClassroomUseCase.execute(studentId, courseIdOrSlug);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
