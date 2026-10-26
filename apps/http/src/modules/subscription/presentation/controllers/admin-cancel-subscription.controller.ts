import { Request, Response, NextFunction } from "express";
import { AdminCancelSubscriptionUseCase } from "../../application/use-cases/admin-cancel-subscription.usecase";
import { adminCancelSubscriptionSchema } from "../validators/subscription.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminCancelSubscriptionController {
  constructor(private readonly adminCancelSubscriptionUseCase: AdminCancelSubscriptionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const id = req.params.id as string;
      const body = adminCancelSubscriptionSchema.parse(req.body);

      const updated = await this.adminCancelSubscriptionUseCase.execute({
        subscriptionId: id,
        immediate: body.immediate,
        reason: body.reason,
      });

      return ApiResponse.success(
        res,
        updated,
        body.immediate
          ? "Subscription revoked immediately"
          : "Subscription scheduled for cancellation at period end"
      );
    } catch (error) {
      next(error);
    }
  };
}
