import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bankDetailApi } from "../api/bank-detail.api";
import type {
  CreateBankDetailPayload,
  UpdateBankVerificationPayload,
  AdminBankDetailsQuery,
} from "../types/bank-detail.types";
import { toast } from "@/lib/toast";

export const bankDetailKeys = {
  all: ["bank-details"] as const,
  my: () => [...bankDetailKeys.all, "my"] as const,
  adminAll: (query?: AdminBankDetailsQuery) => [...bankDetailKeys.all, "admin", query] as const,
  adminDetail: (id: string) => [...bankDetailKeys.all, "admin", "detail", id] as const,
};

/**
 * Hook to fetch current authenticated user's bank accounts
 */
export function useMyBankDetails() {
  return useQuery({
    queryKey: bankDetailKeys.my(),
    queryFn: () => bankDetailApi.getMyBankDetails(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to add a new bank account or UPI ID
 */
export function useCreateBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBankDetailPayload) => bankDetailApi.createBankDetail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailKeys.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Bank details added successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to save bank details");
    },
  });
}

/**
 * Hook to set a bank account as primary
 */
export function useSetPrimaryBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankDetailApi.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailKeys.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Primary bank account updated!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update primary account");
    },
  });
}

/**
 * Hook to delete a bank account
 */
export function useDeleteBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankDetailApi.deleteBankDetail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankDetailKeys.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Bank account removed successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete bank account");
    },
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Admin hook to fetch all bank accounts
 */
export function useAdminBankDetails(query?: AdminBankDetailsQuery) {
  return useQuery({
    queryKey: bankDetailKeys.adminAll(query),
    queryFn: () => bankDetailApi.adminGetAll(query),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Admin hook to fetch single bank detail
 */
export function useAdminBankDetail(id: string) {
  return useQuery({
    queryKey: bankDetailKeys.adminDetail(id),
    queryFn: () => bankDetailApi.adminGetById(id),
    enabled: Boolean(id),
  });
}

/**
 * Admin hook to verify/reject bank details
 */
export function useAdminUpdateBankVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBankVerificationPayload }) =>
      bankDetailApi.adminUpdateVerification(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bankDetailKeys.all });
      queryClient.invalidateQueries({ queryKey: bankDetailKeys.adminDetail(variables.id) });
      toast.success(`Bank account status updated to ${variables.payload.status}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update verification status");
    },
  });
}
