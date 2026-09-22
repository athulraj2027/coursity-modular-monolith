import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import {
  subscriptionApi,
  type AdminSubscriptionsQueryParams,
} from "../api/subscription.api";
import type {
  AdminCancelSubscriptionInput,
  AdminRefundInvoiceInput,
  AdminExtendSubscriptionInput,
  AdminChangePlanInput,
} from "../types/plan.types";

export const ADMIN_SUBSCRIPTIONS_QUERY_KEY = ["admin-subscriptions"];
export const ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY = ["admin-subscription-detail"];

// 1. Hook for admin subscriptions list
export function useAdminSubscriptions(params: AdminSubscriptionsQueryParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_SUBSCRIPTIONS_QUERY_KEY, params],
    queryFn: () => subscriptionApi.getAdminSubscriptions(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

// 2. Hook for admin subscription detail
export function useAdminSubscriptionDetail(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY, id],
    queryFn: () => subscriptionApi.getAdminSubscriptionDetail(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

// 3. Hook for admin cancel subscription
export function useAdminCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCancelSubscriptionInput) =>
      subscriptionApi.cancelSubscription(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY, variables.subscriptionId],
      });
      toast.success(
        variables.immediate
          ? "Subscription revoked and cancelled immediately."
          : "Subscription marked to cancel at the end of billing period."
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });
}

// 4. Hook for admin refund invoice
export function useAdminRefundInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminRefundInvoiceInput) =>
      subscriptionApi.refundInvoice(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY, variables.subscriptionId],
      });
      toast.success("Refund processed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process refund");
    },
  });
}

// 5. Hook for admin extend subscription
export function useAdminExtendSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminExtendSubscriptionInput) =>
      subscriptionApi.extendSubscription(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY, variables.subscriptionId],
      });
      toast.success("Subscription period extended successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to extend subscription");
    },
  });
}

// 6. Hook for admin change plan
export function useAdminChangeSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminChangePlanInput) =>
      subscriptionApi.changeSubscriptionPlan(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SUBSCRIPTIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_SUBSCRIPTION_DETAIL_QUERY_KEY, variables.subscriptionId],
      });
      toast.success("Subscription plan updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change subscription plan");
    },
  });
}
