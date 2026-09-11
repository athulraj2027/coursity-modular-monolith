export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "PENDING";
export type FeatureType = "BOOLEAN" | "NUMERIC" | "TEXT";
export type FeatureCategory = "LIVE_STREAMING" | "COURSES" | "STORAGE" | "RECORDING" | "ANALYTICS" | "COMMUNITY" | "SUPPORT";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Feature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  featureType: FeatureType;
  category: FeatureCategory;
  unit: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureId: string;
  feature?: Feature;
  value: string;
  isUnlimited: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherSubscription {
  id: string;
  teacherProfileId: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  trialEndsAt: Date | null;
  externalCustomerId: string | null;
  externalSubscriptionId: string | null;
  usages?: TeacherPlanUsage[];
  invoices?: SubscriptionInvoice[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherPlanUsage {
  id: string;
  subscriptionId: string;
  teacherProfileId: string;
  featureCode: string;
  currentUsage: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  receiptUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotaEvaluationResult {
  allowed: boolean;
  featureCode: string;
  limit: number;
  isUnlimited: boolean;
  currentUsage: number;
  remaining: number;
  unit: string | null;
  reason?: string;
}
