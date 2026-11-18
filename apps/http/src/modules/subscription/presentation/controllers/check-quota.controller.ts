import { Request, Response, NextFunction } from "express";
import { CheckQuotaUseCase } from "../../application/use-cases/check-quota.usecase";
import { checkQuotaQuerySchema } from "../schemas/subscription.schema";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";
import { ITeacherProfileResolver } from "./get-my-subscription.controller";

export class CheckQuotaController {
  constructor(
    private readonly checkQuotaUseCase: CheckQuotaUseCase,
    private readonly profileRepo: ITeacherProfileResolver = profileRepository
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = checkQuotaQuerySchema.parse(req.query);
      const teacherProfileId = await this.profileRepo.getOrCreateTeacherProfileId(req.user.userId);

      const evaluation = await this.checkQuotaUseCase.execute(
        teacherProfileId,
        validated.featureCode,
        validated.amount
      );

      return ApiResponse.success(res, evaluation);
    } catch (error) {
      next(error);
    }
  };
}
