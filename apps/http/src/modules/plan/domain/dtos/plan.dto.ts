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
