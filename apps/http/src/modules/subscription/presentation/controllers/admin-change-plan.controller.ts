import { Request, Response, NextFunction } from "express";
import { AdminChangeSubscriptionPlanUseCase } from "../../application/use-cases/admin-change-subscription-plan.usecase";
import { adminChangeSubscriptionPlanSchema } from "../validators/subscription.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminChangeSubscriptionPlanController {
  constructor(private readonly adminChangeSubscriptionPlanUseCase: AdminChangeSubscriptionPlanUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const id = req.params.id as string;
      const body = adminChangeSubscriptionPlanSchema.parse(req.body);

      const updated = await this.adminChangeSubscriptionPlanUseCase.execute({
        subscriptionId: id,
        newPlanId: body.newPlanId,
        resetPeriod: body.resetPeriod,
      });

      return ApiResponse.success(res, updated, "Subscription plan updated successfully");
    } catch (error) {
      next(error);
    }
  };
}
