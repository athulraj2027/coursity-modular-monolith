import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { createModuleSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class CreateModuleController {
  constructor(
    private readonly teacherCourseUseCase: TeacherCourseUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = createModuleSchema.parse(req.body);

      const module = await this.teacherCourseUseCase.createModule(teacherProfileId, {
        ...validated,
        courseId,
      });

      return ApiResponse.created(res, module, "Module added successfully");
    } catch (error) {
      next(error);
    }
  };
}
