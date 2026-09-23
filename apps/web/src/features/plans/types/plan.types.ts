export type BillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "PENDING";
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

export interface CreateRazorpayOrderInput {
  planId: string;
  billingCycle?: BillingCycle;
  userName?: string;
  userEmail?: string;
  phone?: string;
  state?: string;
  country?: string;
  gstin?: string;
  offerId?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  userEmail?: string;
  userName?: string;
}

export interface VerifyRazorpayPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: string;
  billingCycle?: BillingCycle;
  userName?: string;
  userEmail?: string;
  phone?: string;
  state?: string;
  country?: string;
  gstin?: string;
  offerId?: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string | null;
  teacherProfileId?: string;
  planId?: string | null;
  plan?: Plan | null;
  planName?: string | null;
  amount: number;
  currency: string;
  baseAmount?: number | null;
  taxAmount?: number | null;
  taxPercent?: number | null;
  totalAmount?: number | null;
  billingCycle?: BillingCycle | null;
  paymentMethod?: string | null;
  paymentGateway?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  receiptUrl?: string | null;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userState?: string | null;
  userCountry?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerState?: string | null;
  customerCountry?: string | null;
  gstin?: string | null;
  paidAt?: string | null;
  createdAt: string;
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
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  trialEndsAt?: string | null;
  totalInvoicedAmount: number;
  invoiceCount: number;
  createdAt: string;
}

export interface AdminSubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  mrr: number;
  totalRevenue: number;
  churnedCount: number;
  pastDueCount: number;
}

export interface AdminSubscriptionsResponse {
  items: AdminSubscriptionListItem[];
  total: number;
  metrics: AdminSubscriptionMetrics;
}

export interface AdminSubscriptionDetail {
  id: string;
  teacherProfileId: string;
  instructor: {
    id: string;
    profileId: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    country?: string | null;
    isApproved: boolean;
    approvalStatus: string;
    courseCount: number;
    createdAt: string;
  };
  planId: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    price: number;
    currency: string;
    billingCycle: BillingCycle;
    trialDays: number;
    isActive: boolean;
    isFeatured: boolean;
    features: {
      id: string;
      featureId: string;
      name?: string;
      code?: string;
      category?: string;
      featureType?: string;
      unit?: string | null;
      value: string;
      isUnlimited: boolean;
    }[];
  } | null;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  trialEndsAt?: string | null;
  externalCustomerId?: string | null;
  externalSubscriptionId?: string | null;
  usages: {
    id: string;
    featureCode: string;
    currentUsage: number;
    periodStart: string;
    periodEnd: string;
  }[];
  invoices: {
    id: string;
    subscriptionId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
    paymentMethod?: string | null;
    receiptUrl?: string | null;
    paidAt?: string | null;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCancelSubscriptionInput {
  subscriptionId: string;
  immediate: boolean;
  reason?: string;
}

export interface AdminRefundInvoiceInput {
  subscriptionId: string;
  invoiceId: string;
  amount?: number;
  reason: string;
  cancelSubscriptionImmediately?: boolean;
}

export interface AdminExtendSubscriptionInput {
  subscriptionId: string;
  daysToAdd?: number;
  newPeriodEnd?: string;
  reason?: string;
}

export interface AdminChangePlanInput {
  subscriptionId: string;
  newPlanId: string;
  resetPeriod?: boolean;
}
