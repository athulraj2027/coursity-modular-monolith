import { Request, Response, NextFunction } from "express";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetPlanByIdController {
  constructor(private readonly adminManagePlansUseCase: AdminManagePlansUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.assertAdmin(req);
      const id = req.params.id as string;
      const plan = await this.adminManagePlansUseCase.getPlanById(id);
      if (!plan) {
        throw new NotFoundError(`Plan with id '${id}' not found`);
      }
      return ApiResponse.success(res, plan);
    } catch (error) {
      next(error);
    }
  };

  private assertAdmin(req: Request) {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const role = (req.user.role || "").toUpperCase();
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      throw new ForbiddenError("Administrative privileges required");
    }
  }
}
