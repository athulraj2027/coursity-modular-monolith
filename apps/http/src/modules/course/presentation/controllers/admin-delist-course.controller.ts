import { Request, Response, NextFunction } from "express";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import { adminDelistCourseSchema } from "../validators/course.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminDelistCourseController {
  constructor(private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage course records.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = adminDelistCourseSchema.parse(req.body);

      const course = await this.adminManageCoursesUseCase.delistCourse(id, validated);

      return ApiResponse.success(
        res,
        course,
        "Course delisted successfully and instructor notified via email"
      );
    } catch (error) {
      next(error);
    }
  };
}
