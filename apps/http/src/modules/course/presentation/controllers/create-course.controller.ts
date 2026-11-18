import { Request, Response, NextFunction } from "express";
import { TeacherCourseUseCase } from "../../application/use-cases/teacher-course.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { createCourseSchema } from "../validators/course.validator";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class CreateCourseController {
  constructor(
    private readonly teacherCourseUseCase: TeacherCourseUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required.");
      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
      const validated = createCourseSchema.parse(req.body);

      const course = await this.teacherCourseUseCase.createCourse({
        ...validated,
        teacherProfileId,
      });

      return ApiResponse.created(res, course, "Course created successfully");
    } catch (error) {
      next(error);
    }
  };
}
