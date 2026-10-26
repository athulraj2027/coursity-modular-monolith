import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { updateCategorySchema } from "../validators/category.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminUpdateCategoryController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const validated = updateCategorySchema.parse(req.body);
      const category = await this.adminManageCategoriesUseCase.updateCategory(id, validated as any);

      return ApiResponse.success(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
