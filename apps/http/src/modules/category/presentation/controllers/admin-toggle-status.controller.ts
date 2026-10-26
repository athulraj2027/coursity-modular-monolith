import { Request, Response, NextFunction } from "express";
import { AdminManageCategoriesUseCase } from "../../application/use-cases/admin-manage-categories.usecase";
import { ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminToggleStatusController {
  constructor(private readonly adminManageCategoriesUseCase: AdminManageCategoriesUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        throw new ForbiddenError("Admin privileges required to manage categories.");
      }
      const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const isActive = req.body.isActive === true;
      const category = await this.adminManageCategoriesUseCase.toggleActive(id, isActive);

      return ApiResponse.success(
        res,
        category,
        `Category ${isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      next(error);
    }
  };
}
