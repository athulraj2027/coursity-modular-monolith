export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "PENDING";
export type FeatureType = "BOOLEAN" | "NUMERIC" | "TEXT";
export type FeatureCategory = "LIVE_STREAMING" | "COURSES" | "STORAGE" | "RECORDING" | "ANALYTICS" | "COMMUNITY" | "SUPPORT";

export interface Feature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  featureType: FeatureType;
  category: FeatureCategory;
  unit: string | null;
  sortOrder: number;
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureId: string;
  feature?: Feature;
  value: string;
  isUnlimited: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features?: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface TeacherPlanUsage {
  id: string;
  subscriptionId: string;
  teacherProfileId: string;
  featureCode: string;
  currentUsage: number;
  periodStart: string;
  periodEnd: string;
}

export interface QuotaSummaryItem {
  featureCode: string;
  featureName: string;
  featureType: FeatureType;
  category: FeatureCategory;
  unit: string | null;
  limit: number | boolean;
  isUnlimited: boolean;
  currentUsage: number;
  remaining: number;
  usagePercentage: number;
}

export interface TeacherSubscription {
  id: string;
  teacherProfileId: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEndsAt: string | null;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
}

export interface TeacherSubscriptionDetails {
  subscription: TeacherSubscription | null;
  usages: TeacherPlanUsage[];
  quotaSummary: QuotaSummaryItem[];
}

export interface SubscribePlanInput {
  planId: string;
  paymentMethod?: string;
  externalCustomerId?: string;
  externalSubscriptionId?: string;
}
