import { Request, Response, NextFunction } from "express";
import { CreateTeacherCouponUseCase } from "../../application/use-cases/create-teacher-coupon.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class CreateCouponController {
  constructor(
    private readonly createCouponUseCase: CreateTeacherCouponUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const coupon = await this.createCouponUseCase.execute(teacherProfileId, req.body);
      return ApiResponse.created(res, coupon, "Teacher coupon created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
