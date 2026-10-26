import { Request, Response, NextFunction } from "express";
import { AdminExtendSubscriptionUseCase } from "../../application/use-cases/admin-extend-subscription.usecase";
import { adminExtendSubscriptionSchema } from "../validators/subscription.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminExtendSubscriptionController {
  constructor(private readonly adminExtendSubscriptionUseCase: AdminExtendSubscriptionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const id = req.params.id as string;
      const body = adminExtendSubscriptionSchema.parse(req.body);

      const updated = await this.adminExtendSubscriptionUseCase.execute({
        subscriptionId: id,
        daysToAdd: body.daysToAdd,
        newPeriodEnd: body.newPeriodEnd ? new Date(body.newPeriodEnd) : undefined,
        reason: body.reason,
      });

      return ApiResponse.success(res, updated, "Subscription period extended successfully");
    } catch (error) {
      next(error);
    }
  };
}
