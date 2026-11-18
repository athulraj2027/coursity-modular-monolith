import { Request, Response, NextFunction } from "express";
import { AdminDeleteCouponUseCase } from "../../application/use-cases/admin-delete-coupon.usecase";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ApiResponse } from "@/shared";

export class AdminDeleteCouponController {
  private readonly deleteUseCase: AdminDeleteCouponUseCase;

  constructor(useCaseOrRepo?: AdminDeleteCouponUseCase | TeacherCouponRepository) {
    if (useCaseOrRepo && "execute" in useCaseOrRepo) {
      this.deleteUseCase = useCaseOrRepo;
    } else {
      this.deleteUseCase = new AdminDeleteCouponUseCase(useCaseOrRepo as TeacherCouponRepository);
    }
  }

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.deleteUseCase.execute(couponId);
      return ApiResponse.success(res, null, "Coupon permanently deleted by Admin.");
    } catch (error) {
      next(error);
    }
  };
}
