import { apiClient } from "@/lib/api-client";
import type {
  Offer,
  PlanOfferResult,
  CreateOfferPayload,
  UpdateOfferPayload,
  AdminOffersQueryParams,
  OfferAnalytics,
} from "../types/offer.types";

export interface PlanOfferApiResponse {
  success: boolean;
  message?: string;
  data: PlanOfferResult;
}

export interface ActiveOffersApiResponse {
  success: boolean;
  data: Offer[];
}

export interface AdminOffersApiResponse {
  success: boolean;
  data: {
    items: Offer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  };
}

export interface OfferDetailApiResponse {
  success: boolean;
  message?: string;
  data: Offer;
}

export interface OfferAnalyticsApiResponse {
  success: boolean;
  data: OfferAnalytics;
}

export const offersApi = {
  // 1. Resolve Active Default Offer & Pricing for Plan Checkout
  getPlanOffer: async (
    planId: string,
    billingCycle?: string,
    offerId?: string
  ): Promise<PlanOfferResult> => {
    const params = new URLSearchParams({ planId });
    if (billingCycle) params.append("billingCycle", billingCycle);
    if (offerId) params.append("offerId", offerId);

    const res = await apiClient<PlanOfferApiResponse>(`/offers/plan-offer?${params.toString()}`, {
      method: "GET",
    });
    return res.data;
  },

  // 2. Get All Active Default Promotional Offers
  getActiveOffers: async (planId?: string, billingCycle?: string): Promise<Offer[]> => {
    const params = new URLSearchParams();
    if (planId) params.append("planId", planId);
    if (billingCycle) params.append("billingCycle", billingCycle);

    const qs = params.toString();
    const url = qs ? `/offers/active?${qs}` : "/offers/active";
    const res = await apiClient<ActiveOffersApiResponse>(url, {
      method: "GET",
    });
    return res.data;
  },

  // Alias for backward compatibility
  getAutoAppliedOffers: async (planId?: string, billingCycle?: string): Promise<Offer[]> => {
    return offersApi.getActiveOffers(planId, billingCycle);
  },

  // 3. Admin Operations
  adminGetOffers: async (params?: AdminOffersQueryParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.discountType && params.discountType !== "all") query.append("discountType", params.discountType);
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const qs = query.toString();
    const url = qs ? `/admin/offers?${qs}` : "/admin/offers";
    const res = await apiClient<AdminOffersApiResponse>(url, {
      method: "GET",
    });
    return res.data;
  },

  adminGetAnalytics: async (): Promise<OfferAnalytics> => {
    const res = await apiClient<OfferAnalyticsApiResponse>("/admin/offers/analytics", {
      method: "GET",
    });
    return res.data;
  },

  adminCreateOffer: async (payload: CreateOfferPayload): Promise<Offer> => {
    const res = await apiClient<OfferDetailApiResponse>("/admin/offers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  adminUpdateOffer: async (id: string, payload: UpdateOfferPayload): Promise<Offer> => {
    const res = await apiClient<OfferDetailApiResponse>(`/admin/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  adminToggleOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient<OfferDetailApiResponse>(`/admin/offers/${id}/toggle`, {
      method: "PATCH",
    });
    return res.data;
  },

  adminDeleteOffer: async (id: string): Promise<void> => {
    await apiClient(`/admin/offers/${id}`, {
      method: "DELETE",
    });
  },
};
