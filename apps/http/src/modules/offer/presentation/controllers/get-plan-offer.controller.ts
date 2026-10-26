import { Request, Response, NextFunction } from "express";
import { GetPlanOfferUseCase } from "../../application/use-cases/get-plan-offer.usecase";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class GetPlanOfferController {
  constructor(private readonly getPlanOfferUseCase: GetPlanOfferUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, billingCycle, offerId } = req.query as {
        planId: string;
        billingCycle?: any;
        offerId?: string;
      };
      const teacherProfileId = req.user?.userId
        ? (await profileRepository.getTeacherProfileIdByUserId(req.user.userId)) || undefined
        : undefined;

      const result = await this.getPlanOfferUseCase.execute({
        planId,
        billingCycle,
        teacherProfileId,
        offerId,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
