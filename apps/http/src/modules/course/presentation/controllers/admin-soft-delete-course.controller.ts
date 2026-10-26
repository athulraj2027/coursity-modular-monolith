import { Request, Response, NextFunction } from "express";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminSoftDeleteCourseController {
  constructor(private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage course records.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const reason = typeof req.body?.reason === "string" ? req.body.reason : undefined;
      const course = await this.adminManageCoursesUseCase.softDelete(id, reason);

      return ApiResponse.success(res, course, "Course archived successfully");
    } catch (error) {
      next(error);
    }
  };
}
