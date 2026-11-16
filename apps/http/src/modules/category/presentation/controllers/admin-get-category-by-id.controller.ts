import { Request, Response, NextFunction } from "express";
import { AdminGetCategoryByIdUseCase } from "../../application/use-cases/admin-get-category-by-id.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetCategoryByIdController {
  constructor(
    private readonly useCase: AdminGetCategoryByIdUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = "getCategoryById" in this.useCase
        ? await this.useCase.getCategoryById(id)
        : await this.useCase.execute(id);

      return ApiResponse.success(res, category);
    } catch (error) {
      next(error);
    }
  };
}
