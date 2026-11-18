import { Request, Response, NextFunction } from "express";
import { AdminRestoreCategoryUseCase } from "../../application/use-cases/admin-restore-category.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminRestoreCategoryController {
  constructor(
    private readonly useCase: AdminRestoreCategoryUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = "restoreCategory" in this.useCase
        ? await this.useCase.restoreCategory(id)
        : await this.useCase.execute(id);

      return ApiResponse.success(res, category, "Category restored successfully");
    } catch (error) {
      next(error);
    }
  };
}
