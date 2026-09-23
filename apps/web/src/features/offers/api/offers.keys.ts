import type { AdminOffersQueryParams } from "../types/offer.types";

export const offerKeys = {
  all: ["offers"] as const,
  active: (planId?: string, billingCycle?: string) =>
    [...offerKeys.all, "active", { planId, billingCycle }] as const,
  autoApplied: (planId?: string, billingCycle?: string) =>
    [...offerKeys.all, "active", { planId, billingCycle }] as const,
  planOffer: (planId?: string, billingCycle?: string) =>
    [...offerKeys.all, "plan-offer", { planId, billingCycle }] as const,
  admin: () => [...offerKeys.all, "admin"] as const,
  adminList: (params?: AdminOffersQueryParams) =>
    [...offerKeys.admin(), "list", params] as const,
  adminAnalytics: () => [...offerKeys.admin(), "analytics"] as const,
  adminDetail: (id: string) => [...offerKeys.admin(), "detail", id] as const,
};
