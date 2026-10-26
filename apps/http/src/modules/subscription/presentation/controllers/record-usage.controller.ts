import { Request, Response, NextFunction } from "express";
import { RecordUsageUseCase } from "../../application/use-cases/record-usage.usecase";
import { recordUsageSchema } from "../validators/subscription.validator";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class RecordUsageController {
  constructor(private readonly recordUsageUseCase: RecordUsageUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const validated = recordUsageSchema.parse(req.body);
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);

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
