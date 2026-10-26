import { Request, Response, NextFunction } from "express";
import { AdminGetSubscriptionsUseCase } from "../../application/use-cases/admin-get-subscriptions.usecase";
import { adminSubscriptionQuerySchema } from "../validators/subscription.validator";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetSubscriptionsController {
  constructor(private readonly adminGetSubscriptionsUseCase: AdminGetSubscriptionsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const query = adminSubscriptionQuerySchema.parse(req.query);
      const result = await this.adminGetSubscriptionsUseCase.execute(query as any);

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
