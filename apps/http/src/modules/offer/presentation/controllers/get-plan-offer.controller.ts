import { Request, Response, NextFunction } from "express";
import { GetPlanOfferUseCase } from "../../application/use-cases/get-plan-offer.usecase";
import { ApiResponse } from "@/shared";
import { getPlanOfferQuerySchema } from "../schemas/offer.schema";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "@/modules/course/domain/services/teacher-profile-resolver.service";

export class GetPlanOfferController {
  constructor(
    private readonly getPlanOfferUseCase: GetPlanOfferUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = getPlanOfferQuerySchema.parse(req.query);

      let teacherProfileId: string | undefined = undefined;
      if (req.user?.userId) {
        const resolved = await this.profileResolver.getTeacherProfileIdByUserId(req.user.userId);
        if (resolved) {
          teacherProfileId = resolved;
        }
      }

      const result = await this.getPlanOfferUseCase.execute({
        planId: validatedQuery.planId,
        billingCycle: validatedQuery.billingCycle as any,
        teacherProfileId,
        offerId: validatedQuery.offerId,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
