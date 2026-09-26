export type DiscountType = "PERCENTAGE" | "FLAT";

export interface CouponRedemption {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string | null;
  courseTitle: string;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  enrolledAt: string;
  status: string;
}

export interface TeacherCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  teacherProfileId: string;
  courseId: string | null;
  courseTitle: string | null;
  courseSlug?: string | null;
  coursePrice?: number | null;
  courseThumbnail?: string | null;
  instructorName?: string | null;
  instructorEmail?: string | null;
  instructorAvatar?: string | null;
  totalDiscountGiven?: number;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerStudent: number;
  validFrom: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  redemptions?: CouponRedemption[];
}

export type TeacherCouponDetail = TeacherCoupon;

export interface AdminCouponMetrics {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
}

export interface AdminCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  discountType?: DiscountType;
  teacherProfileId?: string;
  courseId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminCouponsResponse {
  items: TeacherCoupon[];
  total: number;
  metrics: AdminCouponMetrics;
}


export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  courseId?: string;
  maxUses?: number;
  maxUsesPerStudent?: number;
  validFrom?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface UpdateCouponPayload {
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  courseId?: string | null;
  maxUses?: number | null;
  maxUsesPerStudent?: number;
  validFrom?: string;
  expiresAt?: string | null;
  isActive?: boolean;
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
