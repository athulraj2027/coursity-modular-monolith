import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetTeacherCourseByIdController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

      const course = await this.teacherCourseUseCase.getTeacherCourseById(teacherProfileId, id);

      return ApiResponse.success(res, course);
    } catch (error) {
      next(error);
    }
  };
}
