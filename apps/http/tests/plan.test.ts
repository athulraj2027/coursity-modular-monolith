import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { QuotaEnforcementService } from "../src/modules/plan/domain/services/quota-enforcement.service";
import {
  SubscriptionRepository,
  UsageRepository,
  PlanRepository,
} from "../src/modules/plan/domain/repositories/plan.repository";
import {
  Plan,
  TeacherSubscription,
  TeacherPlanUsage,
  Feature,
  SubscriptionStatus,
} from "../src/modules/plan/domain/entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../src/modules/plan/domain/dtos/plan.dto";
import { GetPlansUseCase } from "../src/modules/plan/application/use-cases/get-plans.usecase";
import { SubscribePlanUseCase } from "../src/modules/plan/application/use-cases/subscribe-plan.usecase";
import { CancelSubscriptionUseCase } from "../src/modules/plan/application/use-cases/cancel-subscription.usecase";
import { RecordUsageUseCase } from "../src/modules/plan/application/use-cases/record-usage.usecase";
import { CheckQuotaUseCase } from "../src/modules/plan/application/use-cases/check-quota.usecase";

class MockPlanRepository implements PlanRepository {
  public plans: Plan[] = [];
  public features: Feature[] = [];

  async findAll(includeInactive = false): Promise<Plan[]> {
    return includeInactive ? this.plans : this.plans.filter((p) => p.isActive);
  }

  async findById(id: string): Promise<Plan | null> {
    return this.plans.find((p) => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    return this.plans.find((p) => p.slug === slug) || null;
  }

  async create(data: CreatePlanDto): Promise<Plan> {
    const plan: Plan = {
      id: `plan_${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      price: data.price,
      currency: data.currency || "USD",
      billingCycle: data.billingCycle || "MONTHLY",
      trialDays: data.trialDays || 0,
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      tierOrder: data.tierOrder || 0,
      badgeText: data.badgeText || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      features: [],
    };
    this.plans.push(plan);
    return plan;
  }

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findById(id);
    if (!plan) throw new Error("Plan not found");
    Object.assign(plan, data, { updatedAt: new Date() });
    return plan;
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.plans.length;
    this.plans = this.plans.filter((p) => p.id !== id);
    return this.plans.length < initialLen;
  }

  async findAllFeatures(): Promise<Feature[]> {
    return this.features;
  }

  async findFeatureByCode(code: string): Promise<Feature | null> {
    return this.features.find((f) => f.code === code) || null;
  }
}

class MockSubscriptionRepository implements SubscriptionRepository {
  public subscriptions: TeacherSubscription[] = [];

  async findActiveByTeacherId(teacherProfileId: string): Promise<TeacherSubscription | null> {
    return (
      this.subscriptions.find(
        (s) =>
          s.teacherProfileId === teacherProfileId &&
          (s.status === "ACTIVE" || s.status === "TRIALING")
      ) || null
    );
  }

  async findById(id: string): Promise<TeacherSubscription | null> {
    return this.subscriptions.find((s) => s.id === id) || null;
  }

  async findAllByTeacherId(teacherProfileId: string): Promise<TeacherSubscription[]> {
    return this.subscriptions.filter((s) => s.teacherProfileId === teacherProfileId);
  }

  async create(data: {
    teacherProfileId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialEndsAt?: Date | null;
    externalCustomerId?: string | null;
    externalSubscriptionId?: string | null;
  }): Promise<TeacherSubscription> {
    const sub: TeacherSubscription = {
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      teacherProfileId: data.teacherProfileId,
      planId: data.planId,
      status: data.status,
      billingCycle: "MONTHLY",
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialEndsAt: data.trialEndsAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.push(sub);
    return sub;
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
    options?: { canceledAt?: Date; cancelAtPeriodEnd?: boolean }
  ): Promise<TeacherSubscription> {
    const sub = await this.findById(id);
    if (!sub) throw new Error("Subscription not found");
    sub.status = status;
    if (options?.canceledAt !== undefined) sub.canceledAt = options.canceledAt;
    if (options?.cancelAtPeriodEnd !== undefined) sub.cancelAtPeriodEnd = options.cancelAtPeriodEnd;
    sub.updatedAt = new Date();
    return sub;
  }

  async changePlan(
    subscriptionId: string,
    newPlanId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date
  ): Promise<TeacherSubscription> {
    const sub = await this.findById(subscriptionId);
    if (!sub) throw new Error("Subscription not found");
    sub.planId = newPlanId;
    sub.currentPeriodStart = newPeriodStart;
    sub.currentPeriodEnd = newPeriodEnd;
    sub.updatedAt = new Date();
    return sub;
  }
}

class MockUsageRepository implements UsageRepository {
  public usages: TeacherPlanUsage[] = [];

  async getCurrentUsage(
    subscriptionId: string,
    featureCode: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage | null> {
    return (
      this.usages.find(
        (u) =>
          u.subscriptionId === subscriptionId &&
          u.featureCode === featureCode &&
          u.periodStart.getTime() === periodStart.getTime()
      ) || null
    );
  }

  async getAllUsagesForPeriod(
    subscriptionId: string,
    periodStart: Date
  ): Promise<TeacherPlanUsage[]> {
    return this.usages.filter(
      (u) =>
        u.subscriptionId === subscriptionId &&
        u.periodStart.getTime() === periodStart.getTime()
    );
  }

  async recordUsage(data: {
    subscriptionId: string;
    teacherProfileId: string;
    featureCode: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    isIncrement?: boolean;
  }): Promise<TeacherPlanUsage> {
    let usage = await this.getCurrentUsage(
      data.subscriptionId,
      data.featureCode,
      data.periodStart
    );

    if (!usage) {
      usage = {
        id: `usage_${Math.random().toString(36).substring(2, 9)}`,
        subscriptionId: data.subscriptionId,
        featureCode: data.featureCode,
        currentUsage: data.amount,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.usages.push(usage);
    } else {
      if (data.isIncrement !== false) {
        usage.currentUsage += data.amount;
      } else {
        usage.currentUsage = data.amount;
      }
      usage.updatedAt = new Date();
    }
    return usage;
  }
}

describe("Plan Module & Dynamic Quota Enforcement", () => {
  let planRepo: MockPlanRepository;
  let subRepo: MockSubscriptionRepository;
  let usageRepo: MockUsageRepository;
  let quotaService: QuotaEnforcementService;

  let testPlan: Plan;
  let teacherProfileId: string;

  beforeEach(async () => {
    planRepo = new MockPlanRepository();
    subRepo = new MockSubscriptionRepository();
    usageRepo = new MockUsageRepository();
    quotaService = new QuotaEnforcementService(subRepo, usageRepo, planRepo);

    teacherProfileId = "tp_teacher123";

    testPlan = await planRepo.create({
      name: "Pro Educator",
      slug: "pro-educator",
      price: 29,
      billingCycle: "MONTHLY",
      isDefault: false,
    });

    testPlan.features = [
      {
        id: "pf_1",
        planId: testPlan.id,
        featureId: "MAX_RECORDED_CLASSES",
        value: "20",
        isUnlimited: false,
        feature: {
          id: "f_1",
          code: "MAX_RECORDED_CLASSES",
          name: "Recorded Classes",
          description: "Max recorded sessions stored",
          featureType: "NUMERIC_QUOTA",
          category: "RECORDINGS",
          unit: "recordings",
          defaultValue: "5",
          isHighlighted: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "pf_2",
        planId: testPlan.id,
        featureId: "LIVE_VIEWER_MINUTES_MONTHLY",
        value: "5000",
        isUnlimited: false,
        feature: {
          id: "f_2",
          code: "LIVE_VIEWER_MINUTES_MONTHLY",
          name: "Live Viewer Minutes",
          description: "Total monthly viewer minutes",
          featureType: "METERED_MONTHLY",
          category: "LIVE_STREAMING",
          unit: "minutes",
          defaultValue: "500",
          isHighlighted: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "pf_3",
        planId: testPlan.id,
        featureId: "MAX_COURSES",
        value: "-1",
        isUnlimited: true,
        feature: {
          id: "f_3",
          code: "MAX_COURSES",
          name: "Max Courses",
          description: "Total active courses",
          featureType: "NUMERIC_QUOTA",
          category: "COURSES",
          unit: "courses",
          defaultValue: "3",
          isHighlighted: true,
          sortOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "pf_4",
        planId: testPlan.id,
        featureId: "HD_STREAMING_1080P",
        value: "true",
        isUnlimited: false,
        feature: {
          id: "f_4",
          code: "HD_STREAMING_1080P",
          name: "1080p HD Streaming",
          description: "Full HD live streaming",
          featureType: "BOOLEAN",
          category: "LIVE_STREAMING",
          unit: null,
          defaultValue: "false",
          isHighlighted: true,
          sortOrder: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "pf_5",
        planId: testPlan.id,
        featureId: "AI_CLASS_SUMMARIES",
        value: "false",
        isUnlimited: false,
        feature: {
          id: "f_5",
          code: "AI_CLASS_SUMMARIES",
          name: "AI Class Summaries",
          description: "Automated AI notes and summaries",
          featureType: "BOOLEAN",
          category: "ANALYTICS_AI",
          unit: null,
          defaultValue: "false",
          isHighlighted: false,
          sortOrder: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const sub = await subRepo.create({
      teacherProfileId,
      planId: testPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date("2026-09-01T00:00:00Z"),
      currentPeriodEnd: new Date("2026-10-01T00:00:00Z"),
    });
    sub.plan = testPlan;
  });

  describe("QuotaEnforcementService", () => {
    it("should allow action when usage is within limits", async () => {
      const result = await quotaService.evaluateQuota(
        teacherProfileId,
        "MAX_RECORDED_CLASSES",
        1
      );

      assert.equal(result.allowed, true);
      assert.equal(result.limit, 20);
      assert.equal(result.currentUsage, 0);
      assert.equal(result.remaining, 20);
      assert.equal(result.unit, "recordings");
      assert.equal(result.reason, undefined);
    });

    it("should reject action when quota is exceeded", async () => {
      const sub = await subRepo.findActiveByTeacherId(teacherProfileId);
      await usageRepo.recordUsage({
        subscriptionId: sub!.id,
        teacherProfileId,
        featureCode: "MAX_RECORDED_CLASSES",
        amount: 20,
        periodStart: sub!.currentPeriodStart,
        periodEnd: sub!.currentPeriodEnd,
        isIncrement: false,
      });

      const result = await quotaService.evaluateQuota(
        teacherProfileId,
        "MAX_RECORDED_CLASSES",
        1
      );

      assert.equal(result.allowed, false);
      assert.equal(result.currentUsage, 20);
      assert.equal(result.remaining, 0);
      assert.match(result.reason || "", /Quota exceeded for 'Recorded Classes'/);
    });

    it("should allow unlimited features regardless of usage", async () => {
      const result = await quotaService.evaluateQuota(teacherProfileId, "MAX_COURSES", 100);

      assert.equal(result.allowed, true);
      assert.equal(result.isUnlimited, true);
      assert.equal(result.remaining, Infinity);
    });

    it("should evaluate boolean feature flags (enabled vs disabled)", async () => {
      const enabledRes = await quotaService.evaluateQuota(
        teacherProfileId,
        "HD_STREAMING_1080P"
      );
      assert.equal(enabledRes.allowed, true);

      const disabledRes = await quotaService.evaluateQuota(
        teacherProfileId,
        "AI_CLASS_SUMMARIES"
      );
      assert.equal(disabledRes.allowed, false);
      assert.match(disabledRes.reason || "", /not enabled/);
    });

    it("should reject evaluation if teacher has no active subscription", async () => {
      const result = await quotaService.evaluateQuota("unsubscribed_teacher", "MAX_COURSES");

      assert.equal(result.allowed, false);
      assert.match(result.reason || "", /No active subscription found/);
    });
  });

  describe("Application Use Cases", () => {
    it("should get all active plans and features", async () => {
      const getPlansUseCase = new GetPlansUseCase(planRepo);
      const res = await getPlansUseCase.execute();

      assert.equal(res.plans.length, 1);
      assert.equal(res.plans[0].slug, "pro-educator");
    });

    it("should check quota via CheckQuotaUseCase", async () => {
      const checkQuotaUseCase = new CheckQuotaUseCase(quotaService);
      const res = await checkQuotaUseCase.execute({
        teacherProfileId,
        featureCode: "LIVE_VIEWER_MINUTES_MONTHLY",
        requiredAmount: 100,
      });

      assert.equal(res.allowed, true);
      assert.equal(res.limit, 5000);
      assert.equal(res.remaining, 5000);
    });

    it("should record usage and update current usage", async () => {
      const recordUsageUseCase = new RecordUsageUseCase(subRepo, usageRepo);
      const usage = await recordUsageUseCase.execute({
        teacherProfileId,
        featureCode: "LIVE_VIEWER_MINUTES_MONTHLY",
        incrementBy: 250,
      });

      assert.equal(usage.currentUsage, 250);

      // Subsequent quota check should reflect updated usage
      const checkResult = await quotaService.evaluateQuota(
        teacherProfileId,
        "LIVE_VIEWER_MINUTES_MONTHLY",
        100
      );
      assert.equal(checkResult.currentUsage, 250);
      assert.equal(checkResult.remaining, 4750);
    });

    it("should subscribe to a new plan", async () => {
      const newPlan = await planRepo.create({
        name: "Elite Academy",
        slug: "elite-academy",
        price: 99,
        billingCycle: "MONTHLY",
      });

      const subscribeUseCase = new SubscribePlanUseCase(subRepo, planRepo);
      const sub = await subscribeUseCase.execute({
        teacherProfileId,
        planId: newPlan.id,
      });

      assert.equal(sub.planId, newPlan.id);
    });

    it("should cancel subscription at period end or immediately", async () => {
      const cancelUseCase = new CancelSubscriptionUseCase(subRepo);
      const sub = await cancelUseCase.execute(teacherProfileId, false);

      assert.equal(sub.cancelAtPeriodEnd, true);

      const subImmediate = await cancelUseCase.execute(teacherProfileId, true);
      assert.equal(subImmediate.status, "CANCELED");
    });
  });
});
