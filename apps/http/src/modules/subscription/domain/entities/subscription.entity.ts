import { BillingCycle, SubscriptionStatus, PaymentStatus } from "@prisma/client";
import { Plan } from "@/modules/plan/domain/entities/plan.entity";

export { BillingCycle, SubscriptionStatus, PaymentStatus };

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
  
  // Enhanced Plan & User Details
  planName?: string | null;
  billingCycle?: BillingCycle | null;
  baseAmount?: number | null;
  taxAmount?: number | null;
  taxPercent?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userAddress?: string | null;
  userState?: string | null;
  userCountry?: string | null;
  gstin?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  
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
