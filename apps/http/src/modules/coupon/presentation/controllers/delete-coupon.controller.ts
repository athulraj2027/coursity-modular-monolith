import { Request, Response, NextFunction } from "express";
import { DeleteTeacherCouponUseCase } from "../../application/use-cases/delete-teacher-coupon.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";

export class DeleteCouponController {
  constructor(
    private readonly deleteCouponUseCase: DeleteTeacherCouponUseCase,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await this.profileResolver.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.deleteCouponUseCase.execute(teacherProfileId, couponId);
      return ApiResponse.success(res, null, "Coupon removed/deactivated successfully.");
    } catch (error) {
      next(error);
    }
  };
}
