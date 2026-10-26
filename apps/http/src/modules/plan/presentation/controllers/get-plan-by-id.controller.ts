import { Request, Response, NextFunction } from "express";
import { AdminManagePlansUseCase } from "../../application/use-cases/admin-manage-plans.usecase";
import { NotFoundError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetPlanByIdController {
  constructor(private readonly adminManagePlansUseCase: AdminManagePlansUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
}
