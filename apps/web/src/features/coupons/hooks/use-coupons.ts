import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "../api/coupon.api";
import type { CreateCouponPayload, UpdateCouponPayload } from "../types/coupon.types";
import { toast } from "@/lib/toast";

export const couponKeys = {
  all: ["coupons"] as const,
  mine: (options?: { courseId?: string; isActive?: boolean }) =>
    [...couponKeys.all, "mine", options] as const,
  detail: (id: string) => [...couponKeys.all, "detail", id] as const,
  validate: (code: string, courseId: string) =>
    [...couponKeys.all, "validate", code, courseId] as const,
  adminList: (params?: any) => [...couponKeys.all, "admin", params] as const,
};

export function useMyCoupons(options?: { courseId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: couponKeys.mine(options),
    queryFn: () => couponApi.getMyCoupons(options),
  });
}

export function useCouponDetail(id: string) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponApi.getCouponById(id),
    enabled: Boolean(id),
  });
}

export function useAdminCoupons(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  discountType?: string;
  teacherProfileId?: string;
  courseId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: couponKeys.adminList(params),
    queryFn: () => couponApi.adminGetCoupons(params),
  });
}

export function useAdminToggleCouponStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      couponApi.adminToggleCouponStatus(id, isActive),
    onSuccess: (coupon) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success(`Coupon ${coupon.code} is now ${coupon.isActive ? "Active" : "Inactive"}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update coupon status");
    },
  });
}

export function useAdminDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponApi.adminDeleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon permanently deleted by Admin.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete coupon");
    },
  });
}

export function useCreateCoupon() {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponApi.createCoupon(payload),
    onSuccess: (coupon) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success(`Coupon "${coupon.code}" created successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      couponApi.updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      toast.success("Coupon deactivated/removed.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove coupon");
    },
  });
}
