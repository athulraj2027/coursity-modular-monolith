import { Request, Response, NextFunction } from "express";
import { RecordUsageUseCase } from "../../application/use-cases/record-usage.usecase";
import { recordUsageSchema } from "../schemas/subscription.schema";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";
import { ITeacherProfileResolver } from "./get-my-subscription.controller";

export class RecordUsageController {
  constructor(
    private readonly recordUsageUseCase: RecordUsageUseCase,
    private readonly profileRepo: ITeacherProfileResolver = profileRepository
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = recordUsageSchema.parse(req.body);
      const teacherProfileId = await this.profileRepo.getOrCreateTeacherProfileId(req.user.userId);

      const usage = await this.recordUsageUseCase.execute(
        teacherProfileId,
        validated.featureCode,
        validated.incrementBy || validated.setAbsoluteValue || 1,
        validated.setAbsoluteValue !== undefined
      );

      return ApiResponse.success(res, usage);
    } catch (error) {
      next(error);
    }
  };
}
