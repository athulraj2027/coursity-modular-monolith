import { TeacherCouponEntity } from "../entities/teacher-coupon.entity";
import { CreateTeacherCouponDto, UpdateTeacherCouponDto } from "../dtos/teacher-coupon.dto";

export interface TeacherCouponRepository {
  create(teacherProfileId: string, data: CreateTeacherCouponDto): Promise<TeacherCouponEntity>;
  findById(id: string): Promise<TeacherCouponEntity | null>;
  findByCodeAndTeacher(teacherProfileId: string, code: string): Promise<TeacherCouponEntity | null>;
  findByCode(code: string): Promise<TeacherCouponEntity | null>;
  listByTeacher(teacherProfileId: string, options?: { courseId?: string; isActive?: boolean }): Promise<TeacherCouponEntity[]>;
  listAllCoupons(filters?: {
    search?: string;
    isActive?: boolean;
    discountType?: "PERCENTAGE" | "FLAT";
    teacherProfileId?: string;
    courseId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    items: TeacherCouponEntity[];
    total: number;
    metrics: {
      totalCoupons: number;
      activeCoupons: number;
      totalRedemptions: number;
      totalDiscountGiven: number;
    };
  }>;
  update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity>;
  delete(id: string): Promise<void>;
  incrementUsedCount(id: string): Promise<void>;
  getStudentUsageCount(couponId: string, studentId: string): Promise<number>;
}

