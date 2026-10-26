import { Request, Response, NextFunction } from "express";
import { UpdateTeacherCouponUseCase } from "../../application/use-cases/update-teacher-coupon.usecase";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class UpdateCouponController {
  constructor(private readonly updateCouponUseCase: UpdateTeacherCouponUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await profileRepository.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await this.updateCouponUseCase.execute(teacherProfileId, couponId, req.body);
      return ApiResponse.success(res, coupon, "Coupon updated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
