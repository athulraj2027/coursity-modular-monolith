import { ITeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { CouponDetailsWithRedemptions } from "../../domain/entities/teacher-coupon.entity";
import { ForbiddenError, NotFoundError } from "@/app/errors";

export interface GetCouponByIdOptions {
  teacherProfileId?: string;
  isAdmin?: boolean;
}

export class GetCouponByIdUseCase {
  constructor(private readonly couponRepo: ITeacherCouponRepository) {}

  async execute(
    couponId: string,
    options?: GetCouponByIdOptions
  ): Promise<CouponDetailsWithRedemptions> {
    const coupon = await this.couponRepo.findCouponWithRedemptions(couponId);
    if (!coupon) {
      throw new NotFoundError("Coupon not found.");
    }

    // Check teacher ownership unless caller is an admin
    if (!options?.isAdmin) {
      if (!options?.teacherProfileId || coupon.teacherProfileId !== options.teacherProfileId) {
        throw new ForbiddenError("You do not have permission to view this coupon.");
      }
    }

    return coupon;
  }
}

