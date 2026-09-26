import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class DeleteTeacherCouponUseCase {
  constructor(private readonly couponRepo: TeacherCouponRepository) {}

  async execute(teacherProfileId: string, couponId: string): Promise<void> {
    const coupon = await this.couponRepo.findById(couponId);
    if (!coupon) {
      throw new NotFoundError("Coupon not found.");
    }

    if (coupon.teacherProfileId !== teacherProfileId) {
      throw new BadRequestError("You do not have permission to delete this coupon.");
    }

    // Soft delete: deactivate the coupon to preserve student enrollment and redemption audit logs
    await this.couponRepo.update(couponId, { isActive: false });
  }
}
