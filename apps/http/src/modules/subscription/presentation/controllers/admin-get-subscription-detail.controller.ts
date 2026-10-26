import { Request, Response, NextFunction } from "express";
import { AdminGetSubscriptionDetailUseCase } from "../../application/use-cases/admin-get-subscription-detail.usecase";
import { UnauthorizedError, ForbiddenError } from "@/app/errors";
import { ApiResponse } from "@/shared/utils/api-response";

export class AdminGetSubscriptionDetailController {
  constructor(private readonly adminGetSubscriptionDetailUseCase: AdminGetSubscriptionDetailUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const role = (req.user.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPERADMIN") throw new ForbiddenError("Administrative privileges required");

      const id = req.params.id as string;
      const detail = await this.adminGetSubscriptionDetailUseCase.execute(id);

      return ApiResponse.success(res, detail);
    } catch (error) {
      next(error);
    }
  };
}
