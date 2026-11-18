import { Request, Response, NextFunction } from "express";
import { AdminCreateCategoryUseCase } from "../../application/use-cases/admin-create-category.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { createCategorySchema } from "../validators/category.validator";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminCreateCategoryController {
  constructor(
    private readonly useCase: AdminCreateCategoryUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const validated = createCategorySchema.parse(req.body);
      const category = "createCategory" in this.useCase
        ? await this.useCase.createCategory(validated as any)
        : await this.useCase.execute(validated as any);

      return ApiResponse.created(res, category, "Category created successfully");
    } catch (error) {
      next(error);
    }
  };
}
