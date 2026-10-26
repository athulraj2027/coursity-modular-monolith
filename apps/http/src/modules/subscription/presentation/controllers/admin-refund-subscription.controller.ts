import { Request, Response, NextFunction } from "express";
import { AdminRefundSubscriptionUseCase } from "../../application/use-cases/admin-refund-subscription.usecase";
import { adminRefundSubscriptionSchema } from "../validators/subscription.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminRefundSubscriptionController {
  constructor(private readonly adminRefundSubscriptionUseCase: AdminRefundSubscriptionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const id = req.params.id as string;
      const body = adminRefundSubscriptionSchema.parse(req.body);

      const result = await this.adminRefundSubscriptionUseCase.execute({
        subscriptionId: id,
        invoiceId: body.invoiceId,
        amount: body.amount,
        reason: body.reason,
        cancelSubscriptionImmediately: body.cancelSubscriptionImmediately,
      });

      return ApiResponse.success(res, result, "Refund processed successfully via Razorpay");
    } catch (error) {
      next(error);
    }
  };
}
