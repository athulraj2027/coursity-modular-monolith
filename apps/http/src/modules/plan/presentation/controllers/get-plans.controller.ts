import { Request, Response, NextFunction } from "express";
import { GetPlansUseCase } from "../../application/use-cases/get-plans.usecase";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetPlansController {
  constructor(private readonly getPlansUseCase: GetPlansUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getPlansUseCase.execute(false);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
