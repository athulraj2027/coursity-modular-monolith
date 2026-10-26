import { Request, Response, NextFunction } from "express";
import { GetTeacherCouponsUseCase } from "../../application/use-cases/get-teacher-coupons.usecase";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { profileRepository } from "@/modules/profile";
import { ApiResponse } from "@/shared";

export class ListMyCouponsController {
  constructor(private readonly getCouponsUseCase: GetTeacherCouponsUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const teacherProfileId = await profileRepository.getTeacherProfileIdByUserId(userId);
      if (!teacherProfileId) throw new ForbiddenError("Teacher profile required.");

      const { courseId, isActive } = req.query;
      const coupons = await this.getCouponsUseCase.execute(teacherProfileId, {
        courseId: courseId ? String(courseId) : undefined,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
      });
      return ApiResponse.success(res, coupons);
    } catch (error) {
      next(error);
    }
  };
}
