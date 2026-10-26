import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { createLessonSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class CreateLessonController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
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
