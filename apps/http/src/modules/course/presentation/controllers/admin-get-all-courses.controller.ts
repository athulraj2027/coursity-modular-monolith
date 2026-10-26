import { Request, Response, NextFunction } from "express";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import { queryCoursesSchema } from "../validators/course.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetAllCoursesController {
  constructor(private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage course records.");
      }
      const query = queryCoursesSchema.parse(req.query);
      const result = await this.adminManageCoursesUseCase.getAllCourses(query as any);

      return ApiResponse.success(res, result.items, "Success", {
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      });
    } catch (error) {
      next(error);
    }
  };
}
