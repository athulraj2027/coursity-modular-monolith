import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersApi } from "../api/offers.api";
import { offerKeys } from "../api/offers.keys";
import type {
  CreateOfferPayload,
  UpdateOfferPayload,
  AdminOffersQueryParams,
} from "../types/offer.types";
import { toast } from "@/lib/toast";

// Public / Teacher Hooks
export function usePlanOffer(planId?: string, billingCycle?: string, offerId?: string) {
  return useQuery({
    queryKey: [...offerKeys.planOffer(planId, billingCycle), offerId],
    queryFn: () => offersApi.getPlanOffer(planId!, billingCycle, offerId),
    enabled: Boolean(planId),
    staleTime: 60 * 1000,
  });
}

export function useActiveOffers(planId?: string, billingCycle?: string) {
  return useQuery({
    queryKey: offerKeys.active(planId, billingCycle),
    queryFn: () => offersApi.getActiveOffers(planId, billingCycle),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAutoAppliedOffers(planId?: string, billingCycle?: string) {
  return useActiveOffers(planId, billingCycle);
}

// Admin Hooks
export function useAdminOffers(params?: AdminOffersQueryParams) {
  return useQuery({
    queryKey: offerKeys.adminList(params),
    queryFn: () => offersApi.adminGetOffers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminOfferAnalytics() {
  return useQuery({
    queryKey: offerKeys.adminAnalytics(),
    queryFn: () => offersApi.adminGetAnalytics(),
  });
}

export function useAdminCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offersApi.adminCreateOffer(payload),
    onSuccess: (createdOffer) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.admin() });
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      toast.success(`Offer "${createdOffer.title}" created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || "Failed to create offer.";
      toast.error(message);
    },
  });
}

export function useAdminUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOfferPayload }) =>
      offersApi.adminUpdateOffer(id, payload),
    onSuccess: (updatedOffer) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.admin() });
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      toast.success(`Offer "${updatedOffer.title}" updated successfully!`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || "Failed to update offer.";
      toast.error(message);
    },
  });
}

export function useAdminToggleOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersApi.adminToggleOffer(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: offerKeys.admin() });
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      toast.success(`Offer "${updated.title}" is now ${updated.isActive ? "active" : "disabled"}.`);
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || "Failed to toggle offer status.";
      toast.error(message);
    },
  });
}

export function useAdminDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersApi.adminDeleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerKeys.admin() });
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      toast.success("Offer deleted successfully.");
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || "Failed to delete offer.";
      toast.error(message);
    },
  });
}
