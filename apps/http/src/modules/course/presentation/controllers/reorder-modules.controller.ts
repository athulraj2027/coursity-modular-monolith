import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { reorderItemsSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class ReorderModulesController {
  constructor(
    private readonly teacherCourseUseCase: TeacherCourseUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const { items } = reorderItemsSchema.parse(req.body);

      await this.teacherCourseUseCase.reorderModules(teacherProfileId, courseId, items);

      return ApiResponse.success(res, undefined, "Modules reordered successfully");
    } catch (error) {
      next(error);
    }
  };
}
