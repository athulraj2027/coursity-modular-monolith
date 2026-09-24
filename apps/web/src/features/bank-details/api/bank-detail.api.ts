import { apiClient } from "@/lib/api-client";
import type {
  BankDetail,
  CreateBankDetailPayload,
  UpdateBankVerificationPayload,
  AdminBankDetailsQuery,
  PaginatedBankDetailsResponse,
} from "../types/bank-detail.types";

export const bankDetailApi = {
  /**
   * Get all bank accounts of current authenticated user
   */
  getMyBankDetails: async (): Promise<BankDetail[]> => {
    const res = await apiClient<{ success: boolean; data: BankDetail[] }>(
      "/bank-details",
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Create a new bank account or UPI ID
   */
  createBankDetail: async (payload: CreateBankDetailPayload): Promise<BankDetail> => {
    const res = await apiClient<{ success: boolean; data: BankDetail; message?: string }>(
      "/bank-details",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  /**
   * Set a bank account as primary
   */
  setPrimary: async (id: string): Promise<BankDetail> => {
    const res = await apiClient<{ success: boolean; data: BankDetail; message?: string }>(
      `/bank-details/${id}/primary`,
      { method: "PATCH" }
    );
    return res.data;
  },

  /**
   * Delete a bank account
   */
  deleteBankDetail: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient<{ success: boolean; data: { success: boolean; message: string } }>(
      `/bank-details/${id}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  // ==========================================
  // ADMIN API
  // ==========================================

  /**
   * Admin fetch all bank details
   */
  adminGetAll: async (query?: AdminBankDetailsQuery): Promise<PaginatedBankDetailsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.page) searchParams.append("page", String(query.page));
    if (query?.limit) searchParams.append("limit", String(query.limit));
    if (query?.search) searchParams.append("search", query.search);
    if (query?.status) searchParams.append("status", query.status);
    if (query?.methodType) searchParams.append("methodType", query.methodType);
    if (query?.userId) searchParams.append("userId", query.userId);

    const queryString = searchParams.toString();
    const res = await apiClient<{ success: boolean; data: PaginatedBankDetailsResponse }>(
      `/bank-details/admin/all${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Admin fetch single bank detail with user
   */
  adminGetById: async (id: string): Promise<BankDetail> => {
    const res = await apiClient<{ success: boolean; data: BankDetail }>(
      `/bank-details/admin/${id}`,
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Admin update verification status
   */
  adminUpdateVerification: async (
    id: string,
    payload: UpdateBankVerificationPayload
  ): Promise<BankDetail> => {
    const res = await apiClient<{ success: boolean; data: BankDetail; message?: string }>(
      `/bank-details/admin/${id}/verification`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
};
