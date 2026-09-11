import { SubscriptionRepository, UsageRepository, PlanRepository } from "../repositories/plan.repository";
import { QuotaEvaluationResult } from "../entities/plan.entity";

export class QuotaEnforcementService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly usageRepo: UsageRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async evaluateQuota(
    teacherProfileId: string,
    featureCode: string,
    requestedAmount = 1
  ): Promise<QuotaEvaluationResult> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);

    if (!activeSub || !activeSub.plan) {
      return {
        allowed: false,
        featureCode,
        limit: 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: 0,
        unit: null,
        reason: "No active subscription found. Please subscribe to a teacher plan.",
      };
    }

    const planFeature = activeSub.plan.features?.find(
      (pf) => pf.feature?.code === featureCode || pf.featureId === featureCode
    );

    if (!planFeature) {
      return {
        allowed: false,
        featureCode,
        limit: 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: 0,
        unit: null,
        reason: `The feature '${featureCode}' is not included in your active '${activeSub.plan.name}' plan.`,
      };
    }

    // Boolean feature flag evaluation
    if (planFeature.feature?.featureType === "BOOLEAN") {
      const isEnabled = planFeature.value === "true" || planFeature.value === "1";
      return {
        allowed: isEnabled,
        featureCode,
        limit: isEnabled ? 1 : 0,
        isUnlimited: false,
        currentUsage: 0,
        remaining: isEnabled ? 1 : 0,
        unit: null,
        reason: isEnabled
          ? undefined
          : `The feature '${planFeature.feature?.name || featureCode}' is not enabled in your '${activeSub.plan.name}' plan. Upgrade to access this feature.`,
      };
    }

    // Unlimited quota check
    if (planFeature.isUnlimited || planFeature.value === "-1") {
      return {
        allowed: true,
        featureCode,
        limit: -1,
        isUnlimited: true,
        currentUsage: 0,
        remaining: Infinity,
        unit: planFeature.feature?.unit || null,
      };
    }

    // Numeric quota evaluation against period usage
    const limit = parseFloat(planFeature.value) || 0;
    const usage = await this.usageRepo.getCurrentUsage(
      activeSub.id,
      featureCode,
      activeSub.currentPeriodStart
    );

    const currentUsage = usage?.currentUsage || 0;
    const remaining = Math.max(0, limit - currentUsage);
    const allowed = currentUsage + requestedAmount <= limit;

    return {
      allowed,
      featureCode,
      limit,
      isUnlimited: false,
      currentUsage,
      remaining,
      unit: planFeature.feature?.unit || null,
      reason: allowed
        ? undefined
        : `Quota exceeded for '${planFeature.feature?.name || featureCode}'. Plan limit is ${limit} ${
            planFeature.feature?.unit || ""
          }, current usage is ${currentUsage} ${planFeature.feature?.unit || ""}. Upgrade your plan to increase limits.`,
    };
  }
}
