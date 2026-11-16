import { ITeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { UpdateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import { CouponValidationPolicy } from "../../domain/policies/coupon-validation.policy";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export class UpdateTeacherCouponUseCase {
  constructor(private readonly couponRepo: ITeacherCouponRepository) {}

  async execute(teacherProfileId: string, couponId: string, dto: UpdateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const coupon = await this.couponRepo.findById(couponId);
    if (!coupon) {
      throw new NotFoundError("Coupon not found.");
    }

    if (coupon.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenError("You do not have permission to update this coupon.");
    }

    const discountType = dto.discountType || coupon.discountType;
    const discountValue = dto.discountValue !== undefined ? dto.discountValue : coupon.discountValue;
    const maxDiscountAmount = dto.maxDiscountAmount !== undefined ? dto.maxDiscountAmount : coupon.maxDiscountAmount;

    CouponValidationPolicy.validateDiscountRules(discountType, discountValue, maxDiscountAmount);

    return this.couponRepo.update(couponId, dto);
  }
}
