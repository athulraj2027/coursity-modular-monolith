import { Request, Response, NextFunction } from "express";
import { TeacherGetCourseStudentsUseCase } from "../../application/use-cases/teacher-get-course-students.usecase";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";
import { ApiResponse } from "@/shared";

export class TeacherGetCourseStudentsController {
  constructor(
    private readonly teacherGetStudentsUseCase: TeacherGetCourseStudentsUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
      const result = await this.teacherGetStudentsUseCase.execute(teacherProfileId, courseId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
