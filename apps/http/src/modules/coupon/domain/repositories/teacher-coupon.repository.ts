import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import {
  TeacherCouponEntity,
  CouponDetailsWithRedemptions,
} from "../entities/teacher-coupon.entity";
import { CreateTeacherCouponDto, UpdateTeacherCouponDto } from "../dtos/teacher-coupon.dto";

export interface AdminCouponFilterParams {
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

export interface CouponMetricsSummary {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
}

export interface AdminCouponsListResult {
  items: TeacherCouponEntity[];
  total: number;
  metrics: CouponMetricsSummary;
}

/**
 * Interface Segregation: Student checkout coupon validation and usage tracking
 */
export interface ICouponValidationRepository {
  findByCode(code: string): Promise<TeacherCouponEntity | null>;
  getStudentUsageCount(couponId: string, studentId: string): Promise<number>;
  incrementUsedCount(id: string): Promise<void>;
}

/**
 * Interface Segregation: Teacher studio coupon CRUD
 */
export interface ITeacherCouponRepository {
  create(teacherProfileId: string, data: CreateTeacherCouponDto): Promise<TeacherCouponEntity>;
  findById(id: string): Promise<TeacherCouponEntity | null>;
  findByCodeAndTeacher(teacherProfileId: string, code: string): Promise<TeacherCouponEntity | null>;
  listByTeacher(
    teacherProfileId: string,
    options?: { courseId?: string; isActive?: boolean }
  ): Promise<TeacherCouponEntity[]>;
  update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity>;
  delete(id: string): Promise<boolean | void>;
  findCouponWithRedemptions(id: string): Promise<CouponDetailsWithRedemptions | null>;
}

/**
 * Interface Segregation: Admin coupon oversight and analytics
 */
export interface IAdminCouponRepository {
  listAllCoupons(filters?: AdminCouponFilterParams): Promise<AdminCouponsListResult>;
  findById(id: string): Promise<TeacherCouponEntity | null>;
  update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity>;
  delete(id: string): Promise<boolean | void>;
}

/**
 * Unified Teacher Coupon Repository contract
 */
export interface TeacherCouponRepository
  extends ICouponValidationRepository,
    ITeacherCouponRepository,
    IAdminCouponRepository,
    IBaseRepository<
      TeacherCouponEntity,
      string,
      any,
      UpdateTeacherCouponDto,
      AdminCouponFilterParams
    > {
  create(teacherProfileId: string, data: CreateTeacherCouponDto): Promise<TeacherCouponEntity>;
  update(id: string, data: UpdateTeacherCouponDto): Promise<TeacherCouponEntity>;
  delete(id: string): Promise<boolean | void>;
}
