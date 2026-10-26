import { Request, Response, NextFunction } from "express";
import { AdminProcessPayoutUseCase } from "../../application/use-cases/admin-process-payout.usecase";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class AdminProcessPayoutController {
  constructor(private readonly adminProcessPayoutUseCase: AdminProcessPayoutUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        throw new UnauthorizedError("Authentication required.");
      }
      const payoutId = String(req.params.id);
      const { status, failureReason, rejectionReason, transactionReference, transactionRef } = req.body;
      const result = await this.adminProcessPayoutUseCase.execute({
        id: payoutId,
        status,
        processedByUserId: adminId,
        rejectionReason: rejectionReason || failureReason,
        transactionRef: transactionRef || transactionReference,
      });
      return ApiResponse.success(res, result, `Payout ${status.toLowerCase()} successfully`);
    } catch (error) {
      next(error);
    }
  };
}
