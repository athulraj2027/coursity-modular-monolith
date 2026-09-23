import { BillingCycle, SubscriptionStatus, PaymentStatus } from "../entities/subscription.entity";
import { Plan } from "@/modules/plan/domain/entities/plan.entity";

export interface CreateSubscriptionDto {
  teacherProfileId: string;
  planId: string;
  status?: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date | null;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
}

export interface SubscribePlanDto {
  planId: string;
  teacherProfileId: string;
  billingCycle?: BillingCycle;
  paymentMethod?: string;
  externalCustomerId?: string;
  externalSubscriptionId?: string;
}

export interface CreateRazorpayOrderDto {
  planId: string;
  teacherProfileId: string;
  userEmail: string;
  userName: string;
  billingCycle?: BillingCycle;
  offerId?: string;
  phone?: string;
  state?: string;
  country?: string;
  gstin?: string;
}

export interface RazorpayOrderResponseDto {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  planSlug: string;
  billingCycle: BillingCycle;
  isMock: boolean;
  offerApplied?: {
    offerId: string;
    title?: string;
    discountAmount: number;
    savings: number;
  };
}

export interface VerifyRazorpayPaymentDto {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: string;
  teacherProfileId: string;
  userEmail: string;
  userName: string;
  billingCycle?: BillingCycle;
  offerId?: string;
  phone?: string;
  state?: string;
  country?: string;
  gstin?: string;
}

export interface AdminSubscriptionFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus | "ALL";
  planId?: string;
  billingCycle?: BillingCycle;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminSubscriptionListItem {
  id: string;
  teacherProfileId: string;
  instructorName: string;
  instructorEmail: string;
  instructorAvatar?: string | null;
  instructorPhone?: string | null;
  planId: string;
  planName: string;
  planSlug: string;
  billingCycle: BillingCycle;
  price: number;
  currency: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | null;
  trialEndsAt?: Date | null;
  totalInvoicedAmount: number;
  invoiceCount: number;
  createdAt: Date;
}

export interface AdminSubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  mrr: number;
  totalRevenue: number;
  churnedCount: number;
  pastDueCount: number;
}

export interface AdminCancelSubscriptionDto {
  subscriptionId: string;
  immediate: boolean;
  reason?: string;
}

export interface AdminRefundSubscriptionDto {
  subscriptionId: string;
  invoiceId: string;
  amount?: number;
  reason: string;
  cancelSubscriptionImmediately?: boolean;
}

export interface AdminExtendSubscriptionDto {
  subscriptionId: string;
  daysToAdd?: number;
  newPeriodEnd?: Date;
  reason?: string;
}

export interface AdminChangeSubscriptionPlanDto {
  subscriptionId: string;
  newPlanId: string;
  resetPeriod?: boolean;
}
