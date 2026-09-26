import { TeacherCouponRepository } from "../../domain/repositories/teacher-coupon.repository";
import { TeacherCouponEntity } from "../../domain/entities/teacher-coupon.entity";

export interface AdminGetCouponsInput {
  search?: string;
  isActive?: boolean;
  discountType?: "PERCENTAGE" | "FLAT";
  teacherProfileId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetCouponsOutput {
  items: TeacherCouponEntity[];
  total: number;
  metrics: {
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalDiscountGiven: number;
  };
}

export class AdminGetCouponsUseCase {
  constructor(private readonly couponRepo: TeacherCouponRepository) {}

  async execute(input: AdminGetCouponsInput): Promise<AdminGetCouponsOutput> {
    return this.couponRepo.listAllCoupons(input);
  }
}
