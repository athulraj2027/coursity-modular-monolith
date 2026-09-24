import { apiClient } from "@/lib/api-client";
import type {
  Wallet,
  TopUpOrderResult,
  VerifyTopUpPayload,
  RequestPayoutPayload,
  PayoutRequest,
  AdminProcessPayoutPayload,
  AdminWalletAdjustmentPayload,
  TransactionsQuery,
  PayoutsQuery,
  AdminWalletsQuery,
  PaginatedTransactionsResponse,
  PaginatedPayoutsResponse,
  PaginatedWalletsResponse,
  WalletTransaction,
} from "../types/wallet.types";

export const walletApi = {
  /**
   * Fetch current authenticated user's wallet
   */
  getMyWallet: async (): Promise<Wallet> => {
    const res = await apiClient<{ success: boolean; data: Wallet }>(
      "/wallet/my",
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Fetch user's paginated transaction ledger
   */
  getTransactions: async (
    query?: TransactionsQuery
  ): Promise<PaginatedTransactionsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.append("page", String(query.page));
    if (query?.limit) searchParams.append("limit", String(query.limit));
    if (query?.type) searchParams.append("type", query.type);
    if (query?.direction) searchParams.append("direction", query.direction);
    if (query?.status) searchParams.append("status", query.status);
    if (query?.startDate) searchParams.append("startDate", query.startDate);
    if (query?.endDate) searchParams.append("endDate", query.endDate);

    const queryString = searchParams.toString();
    const res = await apiClient<{
      success: boolean;
      data: PaginatedTransactionsResponse;
    }>(`/wallet/transactions${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Create Razorpay top-up order
   */
  createTopUpOrder: async (amount: number): Promise<TopUpOrderResult> => {
    const res = await apiClient<{
      success: boolean;
      data: TopUpOrderResult;
      message?: string;
    }>("/wallet/topup/create-order", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    return res.data;
  },

  /**
   * Verify Razorpay top-up payment
   */
  verifyTopUp: async (
    payload: VerifyTopUpPayload
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> => {
    const res = await apiClient<{
      success: boolean;
      data: { wallet: Wallet; transaction: WalletTransaction };
      message?: string;
    }>("/wallet/topup/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Request payout withdrawal (Teachers)
   */
  requestPayout: async (payload: RequestPayoutPayload): Promise<PayoutRequest> => {
    const res = await apiClient<{
      success: boolean;
      data: PayoutRequest;
      message?: string;
    }>("/wallet/payouts/request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Get current user's past payout requests
   */
  getMyPayouts: async (query?: PayoutsQuery): Promise<PaginatedPayoutsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.append("page", String(query.page));
    if (query?.limit) searchParams.append("limit", String(query.limit));
    if (query?.status) searchParams.append("status", query.status);

    const queryString = searchParams.toString();
    const res = await apiClient<{
      success: boolean;
      data: PaginatedPayoutsResponse;
    }>(`/wallet/payouts/my${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return res.data;
  },

  // ==========================================
  // ADMIN API
  // ==========================================

  /**
   * Admin fetch all user wallets
   */
  adminGetAllWallets: async (
    query?: AdminWalletsQuery
  ): Promise<PaginatedWalletsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.append("page", String(query.page));
    if (query?.limit) searchParams.append("limit", String(query.limit));
    if (query?.search) searchParams.append("search", query.search);
    if (query?.status) searchParams.append("status", query.status);

    const queryString = searchParams.toString();
    const res = await apiClient<{
      success: boolean;
      data: PaginatedWalletsResponse;
    }>(`/wallet/admin/wallets${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Admin fetch all payout requests
   */
  adminGetAllPayouts: async (
    query?: PayoutsQuery
  ): Promise<PaginatedPayoutsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.append("page", String(query.page));
    if (query?.limit) searchParams.append("limit", String(query.limit));
    if (query?.search) searchParams.append("search", query.search);
    if (query?.status) searchParams.append("status", query.status);
    if (query?.userId) searchParams.append("userId", query.userId);

    const queryString = searchParams.toString();
    const res = await apiClient<{
      success: boolean;
      data: PaginatedPayoutsResponse;
    }>(`/wallet/admin/payouts${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Admin process payout request
   */
  adminProcessPayout: async (
    id: string,
    payload: AdminProcessPayoutPayload
  ): Promise<PayoutRequest> => {
    const res = await apiClient<{
      success: boolean;
      data: PayoutRequest;
      message?: string;
    }>(`/wallet/admin/payouts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Admin manual wallet adjustment
   */
  adminWalletAdjustment: async (
    payload: AdminWalletAdjustmentPayload
  ): Promise<{ wallet: Wallet; transaction: WalletTransaction }> => {
    const res = await apiClient<{
      success: boolean;
      data: { wallet: Wallet; transaction: WalletTransaction };
      message?: string;
    }>("/wallet/admin/adjustment", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
