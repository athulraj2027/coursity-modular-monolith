import {
  TeacherSubscription,
  TeacherPlanUsage,
  QuotaEvaluationResult,
  SubscriptionStatus,
} from "../entities/subscription.entity";
import {
  CreateSubscriptionDto,
  AdminSubscriptionFilterDto,
  AdminSubscriptionListItem,
  AdminSubscriptionMetrics,
} from "../dtos/subscription.dto";

export interface SubscriptionRepository {
  findById(id: string): Promise<TeacherSubscription | null>;
  findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null>;
  create(data: CreateSubscriptionDto): Promise<TeacherSubscription>;
  updateStatus(
    id: string,
    status: SubscriptionStatus,
    canceledAt?: Date | null
  ): Promise<TeacherSubscription>;
  cancelAtPeriodEnd(id: string, cancel: boolean): Promise<TeacherSubscription>;
  changePlan(
    id: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription>;

  // Metered Usage
  getUsage(subscriptionId: string, featureCode: string, periodStart: Date): Promise<TeacherPlanUsage | null>;
  recordUsage(
    subscriptionId: string,
    teacherProfileId: string,
    featureCode: string,
    periodStart: Date,
    periodEnd: Date,
    amount: number,
    isAbsolute?: boolean
  ): Promise<TeacherPlanUsage>;
  getAllCurrentUsages(subscriptionId: string): Promise<TeacherPlanUsage[]>;

  // Quota Verification
  evaluateQuota(teacherProfileId: string, featureCode: string, requestedAmount?: number): Promise<QuotaEvaluationResult>;

  // Admin Subscriptions
  adminFindAll(filter: AdminSubscriptionFilterDto): Promise<{
    items: AdminSubscriptionListItem[];
    total: number;
    metrics: AdminSubscriptionMetrics;
  }>;
  adminFindById(id: string): Promise<any | null>;
  adminExtendPeriod(id: string, newPeriodEnd: Date): Promise<TeacherSubscription>;
  adminUpdateInvoiceStatus(
    invoiceId: string,
    status: "PAID" | "PENDING" | "FAILED" | "REFUNDED",
    receiptUrl?: string
  ): Promise<any>;
}
