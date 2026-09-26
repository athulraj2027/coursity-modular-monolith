import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { UpdateTeacherCouponDto } from "../../domain/dtos/teacher-coupon.dto";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class UpdateTeacherCouponUseCase {
  constructor(private readonly couponRepo: TeacherCouponRepository) {}

  async execute(teacherProfileId: string, couponId: string, dto: UpdateTeacherCouponDto): Promise<TeacherCouponEntity> {
    const coupon = await this.couponRepo.findById(couponId);
    if (!coupon) {
      throw new NotFoundError("Coupon not found.");
    }

    if (coupon.teacherProfileId !== teacherProfileId) {
      throw new BadRequestError("You do not have permission to update this coupon.");
    }

    if (dto.discountValue !== undefined && dto.discountValue <= 0) {
      throw new BadRequestError("Discount value must be greater than zero.");
    }

    if (dto.discountType === "PERCENTAGE" && dto.discountValue !== undefined && dto.discountValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%.");
    }

    return this.couponRepo.update(couponId, dto);
  }
}
