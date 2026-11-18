import { Request, Response, NextFunction } from "express";
import { AdminGetCategoryTreeUseCase } from "../../application/use-cases/admin-get-category-tree.usecase";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetCategoryTreeController {
  constructor(
    private readonly useCase: AdminGetCategoryTreeUseCase | AdminManageCategoriesUseCase
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const includeInactive = req.query.includeInactive !== "false";
      const includeDeleted = req.query.includeDeleted === "true";
      const tree = "getCategoryTree" in this.useCase
        ? await this.useCase.getCategoryTree(includeInactive, includeDeleted)
        : await this.useCase.execute(includeInactive, includeDeleted);

      return ApiResponse.success(res, tree);
    } catch (error) {
      next(error);
    }
  };
}
