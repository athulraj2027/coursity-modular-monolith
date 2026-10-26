import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminGetCategoryTreeController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const includeInactive = req.query.includeInactive !== "false";
      const includeDeleted = req.query.includeDeleted === "true";
      const tree = await this.adminManageCategoriesUseCase.getCategoryTree(
        includeInactive,
        includeDeleted
      );

      return ApiResponse.success(res, tree);
    } catch (error) {
      next(error);
    }
  };
}
