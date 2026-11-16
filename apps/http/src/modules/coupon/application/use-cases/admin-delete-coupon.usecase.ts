import { IAdminCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { NotFoundError } from "@/app/errors";

export class AdminDeleteCouponUseCase {
  constructor(private readonly couponRepo: IAdminCouponRepository) { }

  async execute(couponId: string): Promise<boolean> {
    const coupon = await this.couponRepo.findById(couponId);
    if (!coupon) {
      throw new NotFoundError("Coupon not found.");
    }

    await this.couponRepo.delete(couponId);
    return true;
  }
}

