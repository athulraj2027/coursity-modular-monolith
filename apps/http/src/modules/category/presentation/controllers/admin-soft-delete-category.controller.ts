import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminSoftDeleteCategoryController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const category = await this.adminManageCategoriesUseCase.softDeleteCategory(id);

      return ApiResponse.success(res, category, "Category moved to trash successfully");
    } catch (error) {
      next(error);
    }
  };
}
