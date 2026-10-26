import { Request, Response, NextFunction } from "express";
import { ValidateCouponUseCase } from "../../application/use-cases/validate-coupon.usecase";
import { ApiResponse } from "@/shared";

export class ValidateCouponController {
  constructor(private readonly validateCouponUseCase: ValidateCouponUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = String(req.query.code || "");
      const courseId = String(req.query.courseId || "");
      const studentId = req.user?.userId || "";
      const result = await this.validateCouponUseCase.execute({
        code,
        courseId,
        studentId,
      });
      return ApiResponse.success(res, result, result.message || "Coupon validated.");
    } catch (error) {
      next(error);
    }
  };
}
