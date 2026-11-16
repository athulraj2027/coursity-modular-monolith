import { Request, Response, NextFunction } from "express";
import { AdminGetAllCategoriesUseCase } from "../../application/use-cases/admin-get-all-categories.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { queryCategoriesSchema } from "../validators/category.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetAllCategoriesController {
  constructor(
    private readonly useCase: AdminGetAllCategoriesUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const query = queryCategoriesSchema.parse(req.query);
      const result = "getAllCategories" in this.useCase
        ? await this.useCase.getAllCategories(query)
        : await this.useCase.execute(query);

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
