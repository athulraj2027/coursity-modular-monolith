import { Request, Response, NextFunction } from "express";
import { CreateTeacherCouponUseCase } from "../../application/use-cases/create-teacher-coupon.usecase";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class CreateCouponController {
  constructor(private readonly createCouponUseCase: CreateTeacherCouponUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await profileRepository.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const coupon = await this.createCouponUseCase.execute(teacherProfileId, req.body);
      return ApiResponse.created(res, coupon, "Teacher coupon created successfully.");
    } catch (error) {
      next(error);
    }
  };
}
