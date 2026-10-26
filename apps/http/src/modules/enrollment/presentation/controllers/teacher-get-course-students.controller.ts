import { Request, Response, NextFunction } from "express";
import { TeacherGetCourseStudentsUseCase } from "../../application/use-cases/teacher-get-course-students.usecase";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class TeacherGetCourseStudentsController {
  constructor(private readonly teacherGetStudentsUseCase: TeacherGetCourseStudentsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await profileRepository.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const courseId = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
      const result = await this.teacherGetStudentsUseCase.execute(teacherProfileId, courseId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
