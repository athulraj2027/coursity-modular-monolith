import { Request, Response, NextFunction } from "express";
import { SubscribePlanUseCase } from "../../application/use-cases/subscribe-plan.usecase";
import { subscribePlanSchema } from "../validators/subscription.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class SubscribePlanController {
  constructor(private readonly subscribePlanUseCase: SubscribePlanUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = subscribePlanSchema.parse(req.body);
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);

      const subscription = await this.subscribePlanUseCase.execute({
        planId: validated.planId,
        teacherProfileId,
        paymentMethod: validated.paymentMethod,
        externalCustomerId: validated.externalCustomerId,
        externalSubscriptionId: validated.externalSubscriptionId,
      });

      return ApiResponse.success(res, subscription, "Successfully subscribed to plan");
    } catch (error) {
      next(error);
    }
  };
}
