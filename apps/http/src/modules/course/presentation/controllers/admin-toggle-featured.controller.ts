import { Request, Response, NextFunction } from "express";
import { AdminManageCoursesUseCase } from "../../application/use-cases/admin-manage-courses.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminToggleFeaturedController {
  constructor(private readonly adminManageCoursesUseCase: AdminManageCoursesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage course records.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const isFeatured = req.body.isFeatured === true;

      const course = await this.adminManageCoursesUseCase.toggleFeatured(id, isFeatured);

      return ApiResponse.success(res, course, `Course featured status updated to ${isFeatured}`);
    } catch (error) {
      next(error);
    }
  };
}
