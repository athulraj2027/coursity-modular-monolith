import { SubscriptionRepository, UsageRepository, PlanRepository } from "../../domain/repositories/plan.repository";
import { TeacherSubscription, TeacherPlanUsage } from "../../domain/entities/plan.entity";

export interface TeacherSubscriptionDetails {
  subscription: TeacherSubscription | null;
  usages: TeacherPlanUsage[];
  quotaSummary: Array<{
    featureCode: string;
    featureName: string;
    featureType: string;
    category: string;
    unit: string | null;
    limit: number | boolean;
    isUnlimited: boolean;
    currentUsage: number;
    remaining: number;
    usagePercentage: number;
  }>;
}

export class GetTeacherSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly usageRepo: UsageRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(teacherProfileId: string): Promise<TeacherSubscriptionDetails> {
    let subscription = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);

    // If teacher has no subscription, auto-provision default / free tier if any active plan exists
    if (!subscription) {
      const activePlans = await this.planRepo.findAll(false);
      const defaultPlan = activePlans.find((p) => p.price === 0) || activePlans[0];
      if (defaultPlan) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        subscription = await this.subscriptionRepo.create({
          teacherProfileId,
          planId: defaultPlan.id,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        });
      }
    }

    if (!subscription || !subscription.plan) {
      return {
        subscription: null,
        usages: [],
        quotaSummary: [],
      };
    }

    const usages = await this.usageRepo.getAllUsagesForPeriod(
      subscription.id,
      subscription.currentPeriodStart
    );

    const usageMap = new Map<string, number>();
    for (const u of usages) {
      usageMap.set(u.featureCode, u.currentUsage);
    }

    const quotaSummary = (subscription.plan.features || []).map((pf) => {
      const featureCode = pf.feature?.code || pf.featureId;
      const featureName = pf.feature?.name || featureCode;
      const featureType = pf.feature?.featureType || "NUMERIC";
      const category = pf.feature?.category || "COURSES";
      const unit = pf.feature?.unit || null;
      const isUnlimited = pf.isUnlimited || pf.value === "-1";

      if (featureType === "BOOLEAN") {
        const isEnabled = pf.value === "true" || pf.value === "1";
        return {
          featureCode,
          featureName,
          featureType,
          category,
          unit,
          limit: isEnabled,
          isUnlimited: false,
          currentUsage: isEnabled ? 1 : 0,
          remaining: isEnabled ? 1 : 0,
          usagePercentage: 0,
        };
      }

      const limit = isUnlimited ? Infinity : parseFloat(pf.value) || 0;
      const currentUsage = usageMap.get(featureCode) || 0;
      const remaining = isUnlimited ? Infinity : Math.max(0, limit - currentUsage);
      const usagePercentage = isUnlimited
        ? 0
        : limit > 0
        ? Math.min(100, Math.round((currentUsage / limit) * 100))
        : 0;

      return {
        featureCode,
        featureName,
        featureType,
        category,
        unit,
        limit: isUnlimited ? -1 : limit,
        isUnlimited,
        currentUsage,
        remaining: isUnlimited ? -1 : remaining,
        usagePercentage,
      };
    });

    return {
      subscription,
      usages,
      quotaSummary,
    };
  }
}
