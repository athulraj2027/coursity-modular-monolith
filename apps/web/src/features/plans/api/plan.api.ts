import { apiClient } from "@/lib/api-client";
import type {
  Plan,
  Feature,
  TeacherSubscription,
  TeacherSubscriptionDetails,
  SubscribePlanInput,
} from "../types/plan.types";

export interface PlansResponse {
  success: boolean;
  data: {
    plans: Plan[];
    features: Feature[];
  };
}

export interface MySubscriptionResponse {
  success: boolean;
  data: TeacherSubscriptionDetails;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  data: TeacherSubscription;
}

export const planApi = {
  // 1. Get all public active plans and features
  getPublicPlans: async (): Promise<{ plans: Plan[]; features: Feature[] }> => {
    const res = await apiClient<PlansResponse>("/plans", {
      method: "GET",
    });
    return res.data;
  },

  // 2. Get current teacher subscription and usage meters
  getMySubscription: async (): Promise<TeacherSubscriptionDetails> => {
    const res = await apiClient<MySubscriptionResponse>("/plans/my-subscription", {
      method: "GET",
    });
    return res.data;
  },

  // 3. Subscribe or upgrade to a plan
  subscribe: async (payload: SubscribePlanInput): Promise<TeacherSubscription> => {
    const res = await apiClient<SubscribeResponse>("/plans/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 4. Cancel subscription
  cancelSubscription: async (immediate = false): Promise<TeacherSubscription> => {
    const res = await apiClient<SubscribeResponse>("/plans/cancel", {
      method: "POST",
      body: JSON.stringify({ immediate }),
    });
    return res.data;
  },

  // 5. Admin: Get all plans (including inactive)
  adminGetAllPlans: async (): Promise<Plan[]> => {
    const res = await apiClient<{ success: boolean; data: Plan[] }>("/plans/admin/all", {
      method: "GET",
    });
    return res.data;
  },

  // 6. Admin: Create plan
  adminCreatePlan: async (payload: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient<{ success: boolean; message: string; data: Plan }>("/plans/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 7. Admin: Update plan
  adminUpdatePlan: async (id: string, payload: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient<{ success: boolean; message: string; data: Plan }>(`/plans/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 8. Admin: Get single plan by id
  adminGetPlanById: async (id: string): Promise<Plan> => {
    const res = await apiClient<{ success: boolean; data: Plan }>(`/plans/admin/${id}`, {
      method: "GET",
    });
    return res.data;
  },

  // 9. Admin: Get all features catalog
  adminGetAllFeatures: async (): Promise<Feature[]> => {
    const res = await apiClient<{ success: boolean; data: Feature[] }>("/plans/admin/features", {
      method: "GET",
    });
    return res.data;
  },

  // 10. Admin: Delete plan
  adminDeletePlan: async (id: string): Promise<boolean> => {
    const res = await apiClient<{ success: boolean; message: string }>(`/plans/admin/${id}`, {
      method: "DELETE",
    });
    return res.success;
  },
};

export default planApi;
