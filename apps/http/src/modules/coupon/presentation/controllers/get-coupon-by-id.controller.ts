import { Request, Response, NextFunction } from "express";
import { GetCouponByIdUseCase } from "../../application/use-cases/get-coupon-by-id.usecase";
import {
  ITeacherProfileResolver,
  defaultTeacherProfileResolver,
} from "../../domain/services/teacher-profile-resolver.service";
import { UnauthorizedError } from "@/app/errors";
import { ApiResponse } from "@/shared";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";

export class GetCouponByIdController {
  private readonly getCouponByIdUseCase: GetCouponByIdUseCase;

  constructor(
    useCaseOrRepo?: GetCouponByIdUseCase | TeacherCouponRepository,
    private readonly profileResolver: ITeacherProfileResolver = defaultTeacherProfileResolver
  ) {
    if (useCaseOrRepo && "execute" in useCaseOrRepo) {
      this.getCouponByIdUseCase = useCaseOrRepo;
    } else {
      this.getCouponByIdUseCase = new GetCouponByIdUseCase(useCaseOrRepo as TeacherCouponRepository);
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("Authentication required.");

      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userRole = req.user?.role?.toUpperCase();
      const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

      let teacherProfileId: string | undefined;
      if (!isAdmin) {
        teacherProfileId = (await this.profileResolver.getTeacherProfileIdByUserId(userId)) || undefined;
      }

      const coupon = await this.getCouponByIdUseCase.execute(couponId, {
        teacherProfileId,
        isAdmin,
      });

      return ApiResponse.success(res, coupon);
    } catch (error) {
      next(error);
    }
  };
}
