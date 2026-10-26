import { Request, Response, NextFunction } from "express";
import { GetUserPayoutsUseCase } from "../../application/use-cases/get-user-payouts.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class GetMyPayoutsController {
  constructor(private readonly getUserPayoutsUseCase: GetUserPayoutsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { page, limit } = req.query as any;
      const payouts = await this.getUserPayoutsUseCase.execute({
        userId,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return ApiResponse.success(res, payouts);
    } catch (error) {
      next(error);
    }
  };
}
