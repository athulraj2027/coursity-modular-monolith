import { Request, Response, NextFunction } from "express";
import { GetTeacherSubscriptionUseCase } from "../../application/use-cases/get-teacher-subscription.usecase";
import { UnauthorizedError, BadRequestError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export class GetMySubscriptionController {
  constructor(private readonly getTeacherSubscriptionUseCase: GetTeacherSubscriptionUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const teacherProfileId = await profileRepository.getOrCreateTeacherProfileId(req.user.userId);
      const details = await this.getTeacherSubscriptionUseCase.execute(teacherProfileId);
      return ApiResponse.success(res, details);
    } catch (error) {
      next(error);
    }
  };
}
