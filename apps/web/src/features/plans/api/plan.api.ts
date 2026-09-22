import { apiClient } from "@/lib/api-client";
import type {
  Plan,
  Feature,
  TeacherSubscription,
  TeacherSubscriptionDetails,
  SubscribePlanInput,
  CreateRazorpayOrderInput,
  RazorpayOrderResponse,
  VerifyRazorpayPaymentInput,
  SubscriptionInvoice,
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

export interface RazorpayOrderApiResponse {
  success: boolean;
  data: RazorpayOrderResponse;
}

export interface VerifyPaymentApiResponse {
  success: boolean;
  message: string;
  data: {
    subscription: TeacherSubscription;
    invoice: SubscriptionInvoice;
  };
}

export interface InvoicesApiResponse {
  success: boolean;
  data: SubscriptionInvoice[];
}

export interface CreateOrUpdatePlanPayload extends Omit<Partial<Plan>, "features"> {
  features?: {
    featureId: string;
    value: string;
    isUnlimited: boolean;
    id?: string;
    planId?: string;
  }[];
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

  // 3. Subscribe or upgrade to a plan (legacy / free tier)
  subscribe: async (payload: SubscribePlanInput): Promise<TeacherSubscription> => {
    const res = await apiClient<SubscribeResponse>("/plans/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 4. Create Razorpay Order
  createRazorpayOrder: async (payload: CreateRazorpayOrderInput): Promise<RazorpayOrderResponse> => {
    const res = await apiClient<RazorpayOrderApiResponse>("/plans/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 5. Verify Razorpay Payment Signature and activate subscription
  verifyRazorpayPayment: async (
    payload: VerifyRazorpayPaymentInput
  ): Promise<{ subscription: TeacherSubscription; invoice: SubscriptionInvoice }> => {
    const res = await apiClient<VerifyPaymentApiResponse>("/plans/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 6. Get teacher billing invoices
  getInvoices: async (): Promise<SubscriptionInvoice[]> => {
    const res = await apiClient<InvoicesApiResponse>("/plans/invoices", {
      method: "GET",
    });
    return res.data;
  },

  // 7. Cancel subscription
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
  adminCreatePlan: async (payload: CreateOrUpdatePlanPayload): Promise<Plan> => {
    const res = await apiClient<{ success: boolean; message: string; data: Plan }>("/plans/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // 7. Admin: Update plan
  adminUpdatePlan: async (id: string, payload: CreateOrUpdatePlanPayload): Promise<Plan> => {
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
