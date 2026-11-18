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

export interface ISubscriptionRepository {
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
}

export interface ISubscriptionUsageRepository {
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
}

export interface IQuotaEvaluationRepository {
  evaluateQuota(teacherProfileId: string, featureCode: string, requestedAmount?: number): Promise<QuotaEvaluationResult>;
}

export interface IAdminSubscriptionRepository {
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

export interface IInvoiceRepository {
  createInvoice(data: any): Promise<any>;
  findInvoiceById(invoiceId: string): Promise<any | null>;
  findInvoicesByTeacher(teacherProfileId: string): Promise<any[]>;
  findTeacherWithUser(teacherProfileId: string): Promise<any | null>;
}

export interface SubscriptionRepository
  extends ISubscriptionRepository,
    ISubscriptionUsageRepository,
    IQuotaEvaluationRepository,
    IAdminSubscriptionRepository,
    IInvoiceRepository {}

export type ISubscriptionCompositeRepository = SubscriptionRepository;
