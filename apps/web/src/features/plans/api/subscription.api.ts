import { apiClient } from "@/lib/api-client";
import type {
  AdminSubscriptionsResponse,
  AdminSubscriptionDetail,
  AdminCancelSubscriptionInput,
  AdminRefundInvoiceInput,
  AdminExtendSubscriptionInput,
  AdminChangePlanInput,
  TeacherSubscription,
} from "../types/plan.types";

export interface AdminSubscriptionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  planId?: string;
  billingCycle?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const subscriptionApi = {
  // 1. Get paginated admin subscriptions list
  async getAdminSubscriptions(params: AdminSubscriptionsQueryParams = {}): Promise<AdminSubscriptionsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status && params.status !== "ALL") searchParams.append("status", params.status);
    if (params.planId && params.planId !== "all") searchParams.append("planId", params.planId);
    if (params.billingCycle && params.billingCycle !== "all") searchParams.append("billingCycle", params.billingCycle);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryStr = searchParams.toString();
    const endpoint = queryStr ? `/plans/admin/subscriptions?${queryStr}` : `/plans/admin/subscriptions`;
    const res = await apiClient<{ success: boolean; data: AdminSubscriptionsResponse }>(endpoint, {
      method: "GET",
    });
    return res.data;
  },

  // 2. Get single admin subscription detail
  async getAdminSubscriptionDetail(id: string): Promise<AdminSubscriptionDetail> {
    const res = await apiClient<{ success: boolean; data: AdminSubscriptionDetail }>(
      `/plans/admin/subscriptions/${id}`,
      {
        method: "GET",
      }
    );
    return res.data;
  },

  // 3. Admin cancel subscription
  async cancelSubscription(payload: AdminCancelSubscriptionInput): Promise<TeacherSubscription> {
    const res = await apiClient<{ success: boolean; message: string; data: TeacherSubscription }>(
      `/plans/admin/subscriptions/${payload.subscriptionId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          immediate: payload.immediate,
          reason: payload.reason,
        }),
      }
    );
    return res.data;
  },

  // 4. Admin issue refund on invoice
  async refundInvoice(payload: AdminRefundInvoiceInput): Promise<any> {
    const res = await apiClient<{ success: boolean; message: string; data: any }>(
      `/plans/admin/subscriptions/${payload.subscriptionId}/refund`,
      {
        method: "POST",
        body: JSON.stringify({
          invoiceId: payload.invoiceId,
          amount: payload.amount,
          reason: payload.reason,
          cancelSubscriptionImmediately: payload.cancelSubscriptionImmediately,
        }),
      }
    );
    return res.data;
  },

  // 5. Admin extend subscription period
  async extendSubscription(payload: AdminExtendSubscriptionInput): Promise<TeacherSubscription> {
    const res = await apiClient<{ success: boolean; message: string; data: TeacherSubscription }>(
      `/plans/admin/subscriptions/${payload.subscriptionId}/extend`,
      {
        method: "POST",
        body: JSON.stringify({
          daysToAdd: payload.daysToAdd,
          newPeriodEnd: payload.newPeriodEnd,
          reason: payload.reason,
        }),
      }
    );
    return res.data;
  },

  // 6. Admin change subscription plan
  async changeSubscriptionPlan(payload: AdminChangePlanInput): Promise<TeacherSubscription> {
    const res = await apiClient<{ success: boolean; message: string; data: TeacherSubscription }>(
      `/plans/admin/subscriptions/${payload.subscriptionId}/change-plan`,
      {
        method: "POST",
        body: JSON.stringify({
          newPlanId: payload.newPlanId,
          resetPeriod: payload.resetPeriod,
        }),
      }
    );
    return res.data;
  },
};

