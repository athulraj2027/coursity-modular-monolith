import { Request, Response, NextFunction } from "express";
import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { ApiResponse } from "@/shared";

export class AdminDeleteCouponController {
  constructor(private readonly couponRepo?: TeacherCouponRepository) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const coupon = await this.couponRepo?.findById(couponId);
      if (!coupon) {
        return ApiResponse.error(res, "Coupon not found", 404);
      }
      await this.couponRepo?.delete(couponId);
      return ApiResponse.success(res, null, "Coupon permanently deleted by Admin.");
    } catch (error) {
      next(error);
    }
  };
}
