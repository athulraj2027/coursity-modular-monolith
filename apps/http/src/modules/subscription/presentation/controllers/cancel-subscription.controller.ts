import { Request, Response, NextFunction } from "express";
import { CancelSubscriptionUseCase } from "../../application/use-cases/cancel-subscription.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";
import { ITeacherProfileResolver } from "./get-my-subscription.controller";

export class CancelSubscriptionController {
  constructor(
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
    private readonly profileRepo: ITeacherProfileResolver = profileRepository
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const teacherProfileId = await this.profileRepo.getOrCreateTeacherProfileId(req.user.userId);
      const immediate = req.body?.immediate === true;

      const subscription = await this.cancelSubscriptionUseCase.execute(
        teacherProfileId,
        immediate
      );

      return ApiResponse.success(
        res,
        subscription,
        immediate
          ? "Subscription cancelled immediately"
          : "Subscription will cancel at the end of current period"
      );
    } catch (error) {
      next(error);
    }
  };
}
