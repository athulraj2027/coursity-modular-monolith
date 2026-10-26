import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { reorderItemsSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class ReorderModulesController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = reorderItemsSchema.parse(req.body);

      await this.teacherCourseUseCase.reorderModules(teacherProfileId, courseId, validated.items);

      return ApiResponse.success(res, undefined, "Modules reordered successfully");
    } catch (error) {
      next(error);
    }
  };
}
