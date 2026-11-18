import {
  IAdminCouponRepository,
  AdminCouponFilterParams,
  AdminCouponsListResult,
} from "../../domain/repositories/teacher-coupon.repository";

export type AdminGetCouponsInput = AdminCouponFilterParams;
export type AdminGetCouponsOutput = AdminCouponsListResult;

export class AdminGetCouponsUseCase {
  constructor(private readonly couponRepo: IAdminCouponRepository) {}

  async execute(input?: AdminGetCouponsInput): Promise<AdminGetCouponsOutput> {
    return this.couponRepo.listAllCoupons(input);
  }
}
