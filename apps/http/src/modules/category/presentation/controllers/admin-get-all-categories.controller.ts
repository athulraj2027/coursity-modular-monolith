import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { queryCategoriesSchema } from "../validators/category.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetAllCategoriesController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const query = queryCategoriesSchema.parse(req.query);
      const result = await this.adminManageCategoriesUseCase.getAllCategories(query);

      return ApiResponse.paginated(res, result.items, {
        total: result.total,
        page: query.page,
        limit: query.limit,
      });
    } catch (error) {
      next(error);
    }
  };
}
