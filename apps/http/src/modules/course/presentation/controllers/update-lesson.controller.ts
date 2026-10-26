import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { updateLessonSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class UpdateLessonController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : (req.params.lessonId as string);
      const validated = updateLessonSchema.parse(req.body);

      const lesson = await this.teacherCourseUseCase.updateLesson(teacherProfileId, lessonId, validated as any);

      return ApiResponse.success(res, lesson, "Lesson updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
