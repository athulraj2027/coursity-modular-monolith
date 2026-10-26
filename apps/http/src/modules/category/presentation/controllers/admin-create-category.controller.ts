import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { createCategorySchema } from "../validators/category.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminCreateCategoryController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const validated = createCategorySchema.parse(req.body);
      const category = await this.adminManageCategoriesUseCase.createCategory(validated as any);

      return ApiResponse.created(res, category, "Category created successfully");
    } catch (error) {
      next(error);
    }
  };
}
