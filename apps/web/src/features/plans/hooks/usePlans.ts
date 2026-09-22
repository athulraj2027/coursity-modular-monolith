import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planApi, type CreateOrUpdatePlanPayload } from "../api/plan.api";
import { toast } from "@/lib/toast";
import type {
  SubscribePlanInput,
  CreateRazorpayOrderInput,
  VerifyRazorpayPaymentInput,
} from "../types/plan.types";

export const PLANS_QUERY_KEY = ["plans"] as const;
export const MY_SUBSCRIPTION_QUERY_KEY = ["my-subscription"] as const;
export const INVOICES_QUERY_KEY = ["invoices"] as const;
export const ADMIN_PLANS_QUERY_KEY = ["admin-plans"] as const;

export function usePlans() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: () => planApi.getPublicPlans(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useMySubscription(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MY_SUBSCRIPTION_QUERY_KEY,
    queryFn: () => planApi.getMySubscription(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    retry: false, // Never retry automatically on auth failure
    enabled: options?.enabled ?? true,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: () => planApi.getInvoices(),
    staleTime: 0,
  });
}

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: (payload: CreateRazorpayOrderInput) => planApi.createRazorpayOrder(payload),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initialize payment gateway order");
    },
  });
}

export function useVerifyRazorpayPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyRazorpayPaymentInput) => planApi.verifyRazorpayPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Subscription activated & payment verified successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment verification failed");
    },
  });
}

export function useSubscribePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscribePlanInput) => planApi.subscribe(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(
        data.trialEndsAt && new Date(data.trialEndsAt) > new Date()
          ? "Free trial activated successfully! Enjoy premium instructor features."
          : "Subscribed to plan successfully!"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to subscribe to plan");
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (immediate?: boolean) => planApi.cancelSubscription(immediate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      toast.info(
        data.cancelAtPeriodEnd
          ? "Subscription set to cancel at end of billing cycle."
          : "Subscription canceled."
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ADMIN_PLANS_QUERY_KEY,
    queryFn: () => planApi.adminGetAllPlans(),
    staleTime: 0,
  });
}

export function useAdminPlan(id?: string) {
  return useQuery({
    queryKey: [...ADMIN_PLANS_QUERY_KEY, id],
    queryFn: () => (id ? planApi.adminGetPlanById(id) : Promise.reject("No plan ID provided")),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useAdminFeatures() {
  return useQuery({
    queryKey: ["admin-features"],
    queryFn: () => planApi.adminGetAllFeatures(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useAdminCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrUpdatePlanPayload) => planApi.adminCreatePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      toast.success("New subscription plan created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create plan");
    },
  });
}

export function useAdminUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateOrUpdatePlanPayload }) =>
      planApi.adminUpdatePlan(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PLANS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      toast.success("Plan updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update plan");
    },
  });
}

export function useAdminDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planApi.adminDeletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      toast.success("Plan deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete plan");
    },
  });
}

