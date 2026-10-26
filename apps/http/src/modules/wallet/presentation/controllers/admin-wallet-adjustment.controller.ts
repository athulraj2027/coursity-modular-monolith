import { Request, Response, NextFunction } from "express";
import { AdminWalletAdjustmentUseCase } from "../../application/use-cases/admin-wallet-adjustment.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminWalletAdjustmentController {
  constructor(private readonly adminWalletAdjustmentUseCase: AdminWalletAdjustmentUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new UnauthorizedError("Authentication required.");
      }
      const { userId, amount, type, direction, description, reason } = req.body;
      const result = await this.adminWalletAdjustmentUseCase.execute({
        userId,
        amount: Number(amount),
        direction: (direction || type) as "CREDIT" | "DEBIT",
        reason: reason || description || "",
        performedByUserId: adminId,
      });
      return ApiResponse.success(res, result, "Wallet balance adjusted successfully");
    } catch (error) {
      next(error);
    }
  };
}
