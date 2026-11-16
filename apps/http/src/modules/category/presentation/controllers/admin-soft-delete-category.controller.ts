import { Request, Response, NextFunction } from "express";
import { AdminSoftDeleteCategoryUseCase } from "../../application/use-cases/admin-soft-delete-category.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminSoftDeleteCategoryController {
  constructor(
    private readonly useCase: AdminSoftDeleteCategoryUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = "softDeleteCategory" in this.useCase
        ? await this.useCase.softDeleteCategory(id)
        : await this.useCase.execute(id);

      return ApiResponse.success(res, category, "Category moved to trash successfully");
    } catch (error) {
      next(error);
    }
  };
}
