import { Request, Response, NextFunction } from "express";
import { AdminToggleCouponStatusUseCase } from "../../application/use-cases/admin-toggle-coupon-status.usecase";
import { ApiResponse } from "@/shared";

export class AdminToggleCouponStatusController {
  constructor(private readonly adminToggleCouponUseCase?: AdminToggleCouponStatusUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.adminToggleCouponUseCase) {
        throw new Error("AdminToggleCouponStatusUseCase not initialized.");
      }
      const couponId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = req.body;
      const coupon = await this.adminToggleCouponUseCase.execute(couponId, isActive);
      return ApiResponse.success(
        res,
        coupon,
        `Coupon status updated to ${coupon.isActive ? "active" : "inactive"}.`
      );
    } catch (error) {
      next(error);
    }
  };
}
