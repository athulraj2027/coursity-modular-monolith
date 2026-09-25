import { apiClient } from "@/lib/api-client";
import type {
  TeacherCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponValidationResult,
} from "../types/coupon.types";

export const couponApi = {
  validateCoupon: async (code: string, courseId: string): Promise<CouponValidationResult> => {
    const res = await apiClient<{ success: boolean; data: CouponValidationResult; message?: string }>(
      `/coupons/validate?code=${encodeURIComponent(code)}&courseId=${encodeURIComponent(courseId)}`,
      { method: "GET" }
    );
    return res.data;
  },

  getMyCoupons: async (options?: { courseId?: string; isActive?: boolean }): Promise<TeacherCoupon[]> => {
    const params = new URLSearchParams();
    if (options?.courseId) params.append("courseId", options.courseId);
    if (options?.isActive !== undefined) params.append("isActive", String(options.isActive));
    const queryString = params.toString();

    const res = await apiClient<{ success: boolean; data: TeacherCoupon[] }>(
      `/coupons/my${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  getCouponById: async (id: string): Promise<TeacherCoupon> => {
    const res = await apiClient<{ success: boolean; data: TeacherCoupon }>(
      `/coupons/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  createCoupon: async (payload: CreateCouponPayload): Promise<TeacherCoupon> => {
    const res = await apiClient<{ success: boolean; data: TeacherCoupon; message?: string }>(
      "/coupons",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  updateCoupon: async (id: string, payload: UpdateCouponPayload): Promise<TeacherCoupon> => {
    const res = await apiClient<{ success: boolean; data: TeacherCoupon; message?: string }>(
      `/coupons/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await apiClient<{ success: boolean }>(`/coupons/${id}`, {
      method: "DELETE",
    });
  },

  adminGetCoupons: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    discountType?: string;
    teacherProfileId?: string;
    courseId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.isActive !== undefined) searchParams.append("isActive", String(params.isActive));
    if (params?.discountType && params.discountType !== "all") searchParams.append("discountType", params.discountType);
    if (params?.teacherProfileId && params.teacherProfileId !== "all") searchParams.append("teacherProfileId", params.teacherProfileId);
    if (params?.courseId && params.courseId !== "all") searchParams.append("courseId", params.courseId);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await apiClient<{
      success: boolean;
      data: {
        items: TeacherCoupon[];
        total: number;
        metrics: {
          totalCoupons: number;
          activeCoupons: number;
          totalRedemptions: number;
          totalDiscountGiven: number;
        };
      };
    }>(`/coupons/admin/all${query}`, { method: "GET" });
    return res.data;
  },

  adminToggleCouponStatus: async (id: string, isActive?: boolean): Promise<TeacherCoupon> => {
    const res = await apiClient<{ success: boolean; data: TeacherCoupon; message?: string }>(
      `/coupons/admin/${id}/toggle-status`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }
    );
    return res.data;
  },

  adminDeleteCoupon: async (id: string): Promise<void> => {
    await apiClient<{ success: boolean }>(`/coupons/admin/${id}`, {
      method: "DELETE",
    });
  },
};

