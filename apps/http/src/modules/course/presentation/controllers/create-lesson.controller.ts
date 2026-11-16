import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { createLessonSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class CreateLessonController {
  constructor(
    private readonly teacherCourseUseCase: TeacherCourseUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);
      const validated = createLessonSchema.parse(req.body);

      const lesson = await this.teacherCourseUseCase.createLesson(teacherProfileId, {
        ...validated,
        moduleId,
      } as any);

      return ApiResponse.created(res, lesson, "Lesson added successfully");
    } catch (error) {
      next(error);
    }
  };
}
