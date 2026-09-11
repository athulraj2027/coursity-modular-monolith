import {
  Plan,
  Feature,
  TeacherSubscription,
  TeacherPlanUsage,
  SubscriptionInvoice,
  SubscriptionStatus,
} from "../entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../dtos/plan.dto";

export interface PlanRepository {
  findAll(includeInactive?: boolean): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findBySlug(slug: string): Promise<Plan | null>;
  create(data: CreatePlanDto): Promise<Plan>;
  update(id: string, data: UpdatePlanDto): Promise<Plan>;
  delete(id: string): Promise<boolean>;
  findAllFeatures(): Promise<Feature[]>;
  findFeatureByCode(code: string): Promise<Feature | null>;
}

export interface SubscriptionRepository {
  findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null>;
  findById(id: string): Promise<TeacherSubscription | null>;
  findAllByTeacherId(teacherProfileId: string): Promise<TeacherSubscription[]>;
  create(data: {
    teacherProfileId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt?: Date | null;
    externalCustomerId?: string | null;
    externalSubscriptionId?: string | null;
  }): Promise<TeacherSubscription>;
  updateStatus(
    id: string,
    status: SubscriptionStatus,
    options?: { canceledAt?: Date; cancelAtPeriodEnd?: boolean }
  ): Promise<TeacherSubscription>;
  changePlan(
    subscriptionId: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription>;
}

export interface UsageRepository {
  getCurrentUsage(
    subscriptionId: string,
    featureCode: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage | null>;
  getAllUsagesForPeriod(
    subscriptionId: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage[]>;
  recordUsage(data: {
    subscriptionId: string;
    teacherProfileId: string;
    featureCode: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    isIncrement?: boolean;
  }): Promise<TeacherPlanUsage>;
}
