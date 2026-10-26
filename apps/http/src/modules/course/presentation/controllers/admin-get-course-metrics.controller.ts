import { Request, Response, NextFunction } from "express";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetCourseMetricsController {
  constructor(private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage course records.");
      }
      const metrics = await this.adminManageCoursesUseCase.getMetrics();
      return ApiResponse.success(res, metrics);
    } catch (error) {
      next(error);
    }
  };
}
