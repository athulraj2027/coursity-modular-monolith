import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import { updateModuleSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class UpdateModuleController {
  constructor(private readonly teacherCourseUseCase: TeacherCourseUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const moduleId = Array.isArray(req.params.moduleId) ? req.params.moduleId[0] : (req.params.moduleId as string);
      const validated = updateModuleSchema.parse(req.body);

      const module = await this.teacherCourseUseCase.updateModule(teacherProfileId, moduleId, validated);

      return ApiResponse.success(res, module, "Module updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
