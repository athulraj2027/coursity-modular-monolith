import { Request, Response, NextFunction } from "express";
import { AdminHardDeleteCategoryUseCase } from "../../application/use-cases/admin-hard-delete-category.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminHardDeleteCategoryController {
  constructor(
    private readonly useCase: AdminHardDeleteCategoryUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      if ("hardDeleteCategory" in this.useCase) {
        await this.useCase.hardDeleteCategory(id);
      } else {
        await this.useCase.execute(id);
      }

      return ApiResponse.success(res, undefined, "Category permanently deleted");
    } catch (error) {
      next(error);
    }
  };
}
