import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class DeleteLessonController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : (req.params.lessonId as string);

      await this.teacherCourseUseCase.deleteLesson(teacherProfileId, lessonId);

      return ApiResponse.success(res, undefined, "Lesson deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
