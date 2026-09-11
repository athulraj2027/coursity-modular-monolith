import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planApi } from "../api/plan.api";
import { toast } from "@/lib/toast";
import type { SubscribePlanInput, Plan } from "../types/plan.types";

export const PLANS_QUERY_KEY = ["plans"] as const;
export const MY_SUBSCRIPTION_QUERY_KEY = ["my-subscription"] as const;
export const ADMIN_PLANS_QUERY_KEY = ["admin-plans"] as const;

export function usePlans() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: () => planApi.getPublicPlans(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: MY_SUBSCRIPTION_QUERY_KEY,
    queryFn: () => planApi.getMySubscription(),
    staleTime: 0,
  });
}

export function useSubscribePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscribePlanInput) => planApi.subscribe(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(
        data.status === "TRIALING"
          ? "Free trial activated successfully! Enjoy premium instructor features."
          : "Subscribed to plan successfully!"
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to subscribe to plan");
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (immediate?: boolean) => planApi.cancelSubscription(immediate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      toast.info(
        data.cancelAtPeriodEnd
          ? "Subscription set to cancel at end of billing cycle."
          : "Subscription canceled."
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel subscription");
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
    mutationFn: (payload: Partial<Plan>) => planApi.adminCreatePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      toast.success("New subscription plan created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create plan");
    },
  });
}

export function useAdminUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Plan> }) =>
      planApi.adminUpdatePlan(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PLANS_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: PLANS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_QUERY_KEY });
      toast.success("Plan updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update plan");
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
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete plan");
    },
  });
}

