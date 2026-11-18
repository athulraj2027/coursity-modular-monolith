import { Request, Response, NextFunction } from "express";
import { GetTeacherSubscriptionUseCase } from "../../application/use-cases/get-teacher-subscription.usecase";
import { UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared/utils/api-response";

export interface ITeacherProfileResolver {
  getOrCreateTeacherProfileId(userId: string): Promise<string>;
}

export class GetMySubscriptionController {
  constructor(
    private readonly getTeacherSubscriptionUseCase: GetTeacherSubscriptionUseCase,
    private readonly profileRepo: ITeacherProfileResolver = profileRepository
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError("Authentication required");
      const teacherProfileId = await this.profileRepo.getOrCreateTeacherProfileId(req.user.userId);
      const details = await this.getTeacherSubscriptionUseCase.execute(teacherProfileId);
      return ApiResponse.success(res, details);
    } catch (error) {
      next(error);
    }
  };
}
