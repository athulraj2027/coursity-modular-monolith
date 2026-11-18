export type DiscountType = "PERCENTAGE" | "FLAT";

export interface TeacherCouponEntityProps {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  teacherProfileId: string;
  courseId?: string | null;
  maxUses?: number | null;
  usedCount?: number;
  maxUsesPerStudent?: number;
  validFrom?: Date;
  expiresAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  courseTitle?: string | null;
  instructorName?: string | null;
  instructorEmail?: string | null;
  instructorAvatar?: string | null;
  totalDiscountGiven?: number;
}

export class TeacherCouponEntity {
  public id: string;
  public code: string;
  public description: string | null;
  public discountType: DiscountType;
  public discountValue: number;
  public maxDiscountAmount: number | null;
  public minOrderAmount: number | null;
  public teacherProfileId: string;
  public courseId: string | null;
  public maxUses: number | null;
  public usedCount: number;
  public maxUsesPerStudent: number;
  public validFrom: Date;
  public expiresAt: Date | null;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public courseTitle?: string | null;
  public instructorName?: string | null;
  public instructorEmail?: string | null;
  public instructorAvatar?: string | null;
  public totalDiscountGiven?: number;

  constructor(props: TeacherCouponEntityProps) {
    this.id = props.id;
    this.code = props.code.toUpperCase().trim();
    this.description = props.description ?? null;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.maxDiscountAmount = props.maxDiscountAmount ?? null;
    this.minOrderAmount = props.minOrderAmount ?? null;
    this.teacherProfileId = props.teacherProfileId;
    this.courseId = props.courseId ?? null;
    this.maxUses = props.maxUses ?? null;
    this.usedCount = props.usedCount ?? 0;
    this.maxUsesPerStudent = props.maxUsesPerStudent ?? 1;
    this.validFrom = props.validFrom ?? new Date();
    this.expiresAt = props.expiresAt ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.courseTitle = props.courseTitle ?? null;
    this.instructorName = props.instructorName ?? null;
    this.instructorEmail = props.instructorEmail ?? null;
    this.instructorAvatar = props.instructorAvatar ?? null;
    this.totalDiscountGiven = props.totalDiscountGiven ?? 0;
  }
}

export interface CouponRedemptionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  courseTitle: string;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: string | null;
  enrolledAt: Date;
  status: string;
}

export interface CouponDetailsWithRedemptions extends TeacherCouponEntity {
  courseSlug?: string | null;
  coursePrice?: number | null;
  courseThumbnail?: string | null;
  redemptions: CouponRedemptionItem[];
}
