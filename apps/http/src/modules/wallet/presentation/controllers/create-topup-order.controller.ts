import { Request, Response, NextFunction } from "express";
import { CreateTopUpOrderUseCase } from "../../application/use-cases/create-topup-order.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateTopUpOrderController {
  constructor(private readonly createTopUpOrderUseCase: CreateTopUpOrderUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("Authentication required. Please sign in.");
      }
      const { amount } = req.body;
      const order = await this.createTopUpOrderUseCase.execute({
        userId,
        amount: Number(amount),
      });
      return ApiResponse.created(res, order, "Top-up order created successfully");
    } catch (error) {
      next(error);
    }
  };
}
