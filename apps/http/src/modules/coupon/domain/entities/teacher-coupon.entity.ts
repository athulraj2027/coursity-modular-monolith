export type DiscountType = "PERCENTAGE" | "FLAT";

export interface TeacherCouponEntity {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  teacherProfileId: string;
  courseId: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerStudent: number;
  validFrom: Date;
  expiresAt: Date | null;
  isActive: Boolean;
  createdAt: Date;
  updatedAt: Date;
  courseTitle?: string | null;
  instructorName?: string | null;
  instructorEmail?: string | null;
  instructorAvatar?: string | null;
  totalDiscountGiven?: number;
}

