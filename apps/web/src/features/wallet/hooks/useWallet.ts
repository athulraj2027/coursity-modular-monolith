import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "../api/wallet.api";
import type {
  TransactionsQuery,
  PayoutsQuery,
  AdminWalletsQuery,
  VerifyTopUpPayload,
  RequestPayoutPayload,
  AdminProcessPayoutPayload,
  AdminWalletAdjustmentPayload,
} from "../types/wallet.types";
import { toast } from "@/lib/toast";

export const walletKeys = {
  all: ["wallets"] as const,
  my: () => [...walletKeys.all, "my"] as const,
  transactions: (query?: TransactionsQuery) =>
    [...walletKeys.all, "transactions", query] as const,
  myPayouts: (query?: PayoutsQuery) =>
    [...walletKeys.all, "myPayouts", query] as const,
  adminWallets: (query?: AdminWalletsQuery) =>
    [...walletKeys.all, "admin", "wallets", query] as const,
  adminPayouts: (query?: PayoutsQuery) =>
    [...walletKeys.all, "admin", "payouts", query] as const,
};

/**
 * Hook to fetch current user's wallet
 */
export function useMyWallet() {
  return useQuery({
    queryKey: walletKeys.my(),
    queryFn: () => walletApi.getMyWallet(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch current user's transaction ledger
 */
export function useWalletTransactions(query?: TransactionsQuery) {
  return useQuery({
    queryKey: walletKeys.transactions(query),
    queryFn: () => walletApi.getTransactions(query),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to create Razorpay top-up order
 */
export function useCreateTopUpOrder() {
  return useMutation({
    mutationFn: (amount: number) => walletApi.createTopUpOrder(amount),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to initialize top-up order");
    },
  });
}

/**
 * Hook to verify Razorpay payment and credit wallet
 */
export function useVerifyTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyTopUpPayload) => walletApi.verifyTopUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.my() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Wallet topped up successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to verify top-up payment");
    },
  });
}

/**
 * Hook to request payout withdrawal (Teachers)
 */
export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestPayoutPayload) => walletApi.requestPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.my() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Payout request submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit payout request");
    },
  });
}

/**
 * Hook to fetch teacher's past payout requests
 */
export function useMyPayouts(query?: PayoutsQuery) {
  return useQuery({
    queryKey: walletKeys.myPayouts(query),
    queryFn: () => walletApi.getMyPayouts(query),
    staleTime: 1000 * 60, // 1 minute
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Admin hook to list all user wallets
 */
export function useAdminWallets(query?: AdminWalletsQuery) {
  return useQuery({
    queryKey: walletKeys.adminWallets(query),
    queryFn: () => walletApi.adminGetAllWallets(query),
    staleTime: 1000 * 30,
  });
}

/**
 * Admin hook to list all payout requests
 */
export function useAdminPayouts(query?: PayoutsQuery) {
  return useQuery({
    queryKey: walletKeys.adminPayouts(query),
    queryFn: () => walletApi.adminGetAllPayouts(query),
    staleTime: 1000 * 30,
  });
}

/**
 * Admin hook to process payout
 */
export function useAdminProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminProcessPayoutPayload }) =>
      walletApi.adminProcessPayout(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success(`Payout request marked as ${variables.payload.status.toLowerCase()}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to process payout request");
    },
  });
}

/**
 * Admin hook to perform manual balance adjustment
 */
export function useAdminWalletAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminWalletAdjustmentPayload) =>
      walletApi.adminWalletAdjustment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success(
        `Wallet ${variables.direction === "CREDIT" ? "credited" : "debited"} successfully!`
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to perform wallet adjustment");
    },
  });
}
