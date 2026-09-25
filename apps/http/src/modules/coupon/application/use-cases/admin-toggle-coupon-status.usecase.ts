import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import { NotFoundError } from "@/app/errors";

export class AdminToggleCouponStatusUseCase {
  constructor(private readonly couponRepo: TeacherCouponRepository) {}

  async execute(couponId: string, isActive?: boolean): Promise<TeacherCouponEntity> {
    const coupon = await this.couponRepo.findById(couponId);
    if (!coupon) {
      throw new NotFoundError("Teacher coupon not found.");
    }

    const nextStatus = isActive !== undefined ? isActive : !coupon.isActive;
    return this.couponRepo.update(couponId, { isActive: nextStatus });
  }
}
