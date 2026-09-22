import { BillingCycle, SubscriptionStatus } from "../entities/plan.entity";

export interface PlanFeatureInput {
  featureId: string;
  value: string;
  isUnlimited?: boolean;
}

export interface CreatePlanDto {
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  price: number;
  currency?: string;
  billingCycle?: BillingCycle;
  trialDays?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  features?: PlanFeatureInput[];
}

export interface UpdatePlanDto {
  name?: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  price?: number;
  currency?: string;
  billingCycle?: BillingCycle;
  trialDays?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  features?: PlanFeatureInput[];
}

export interface SubscribePlanDto {
  planId: string;
  teacherProfileId: string;
  paymentMethod?: string;
  externalCustomerId?: string;
  externalSubscriptionId?: string;
}

export interface RecordUsageDto {
  teacherProfileId: string;
  featureCode: string;
  incrementBy?: number;
  setAbsoluteValue?: number;
}

export interface CheckQuotaDto {
  teacherProfileId: string;
  featureCode: string;
  requiredAmount?: number;
}

export interface CreateRazorpayOrderDto {
  planId: string;
  teacherProfileId: string;
  userEmail: string;
  userName: string;
  billingCycle?: BillingCycle;
  phone?: string;
  state?: string;
  country?: string;
  gstin?: string;
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
}

