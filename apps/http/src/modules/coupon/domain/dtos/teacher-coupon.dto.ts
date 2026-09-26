import { DiscountType } from "../entities/teacher-coupon.entity";

export interface CreateTeacherCouponDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  courseId?: string;
  maxUses?: number;
  maxUsesPerStudent?: number;
  validFrom?: Date;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface UpdateTeacherCouponDto {
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  courseId?: string | null;
  maxUses?: number | null;
  maxUsesPerStudent?: number;
  validFrom?: Date;
  expiresAt?: Date | null;
  isActive?: boolean;
}

export interface ValidateCouponDto {
  code: string;
  courseId: string;
  studentId: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  couponId?: string;
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  message?: string;
}
