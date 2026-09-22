import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import {
  TeacherSubscription,
  TeacherPlanUsage,
  QuotaEvaluationResult,
} from "../../domain/entities/subscription.entity";

export interface TeacherSubscriptionDetailsResult {
  subscription: TeacherSubscription | null;
  usages: TeacherPlanUsage[];
  quotaSummary: Array<{
    featureCode: string;
    featureName: string;
    name: string;
    featureType: "NUMERIC" | "BOOLEAN" | "TEXT";
    category: string;
    limit: number | boolean;
    isUnlimited: boolean;
    currentUsage: number;
    remaining: number;
    usagePercentage: number;
    unit: string | null;
    isAvailable: boolean;
  }>;
}

export class GetTeacherSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(teacherProfileId: string): Promise<TeacherSubscriptionDetailsResult> {
    let subscription = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);

    // If no active subscription exists, assign default free starter tier
    if (!subscription) {
      const freePlan = await this.planRepo.findBySlug("starter");
      if (freePlan) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);

        subscription = await this.subscriptionRepo.create({
          teacherProfileId,
          planId: freePlan.id,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        });
      }
    }

    if (!subscription) {
      return {
        subscription: null,
        usages: [],
        quotaSummary: [],
      };
    }

    const usages = await this.subscriptionRepo.getAllCurrentUsages(subscription.id);
    const quotaSummary: Array<any> = [];

    // Ensure plan features are loaded
    let features = subscription.plan?.features || [];
    if (features.length === 0 && subscription.planId) {
      const fullPlan = await this.planRepo.findById(subscription.planId);
      if (fullPlan?.features && fullPlan.features.length > 0) {
        features = fullPlan.features as any;
      }
    }

    // Fallback: If no features attached to plan, load starter plan or catalog features
    if (features.length === 0) {
      const starterPlan = await this.planRepo.findBySlug("starter");
      if (starterPlan?.features && starterPlan.features.length > 0) {
        features = starterPlan.features as any;
      }
    }

    for (const pf of features) {
      const featCode = pf.feature?.code || pf.featureId;
      try {
        const evaluation: QuotaEvaluationResult = await this.subscriptionRepo.evaluateQuota(
          teacherProfileId,
          featCode
        );

        const isUnlimited = evaluation.isUnlimited || pf.isUnlimited || false;
        const numericLimit = typeof evaluation.limit === "number" ? evaluation.limit : parseFloat(pf.value);
        const currentUsage = evaluation.currentUsage || 0;
        const featureType =
          pf.feature?.featureType ||
          (typeof evaluation.limit === "number" && evaluation.limit > 0 ? "NUMERIC" : "BOOLEAN");

        const usagePercentage =
          !isUnlimited && numericLimit > 0
            ? Math.min(100, Math.round((currentUsage / numericLimit) * 100))
            : 0;

        quotaSummary.push({
          featureCode: featCode,
          featureName: pf.feature?.name || featCode,
          name: pf.feature?.name || featCode,
          featureType,
          category: pf.feature?.category || "COURSES",
          limit: isUnlimited ? -1 : numericLimit,
          isUnlimited,
          currentUsage,
          remaining: evaluation.remaining,
          usagePercentage,
          unit: pf.feature?.unit || evaluation.unit || null,
          isAvailable: evaluation.allowed,
        });
      } catch (err) {
        // Graceful fallback for this individual feature
        const isUnlimited = pf.isUnlimited || false;
        const numericLimit = parseFloat(pf.value);
        quotaSummary.push({
          featureCode: featCode,
          featureName: pf.feature?.name || featCode,
          name: pf.feature?.name || featCode,
          featureType: pf.feature?.featureType || (!isNaN(numericLimit) && numericLimit > 0 ? "NUMERIC" : "BOOLEAN"),
          category: pf.feature?.category || "COURSES",
          limit: isUnlimited ? -1 : numericLimit,
          isUnlimited,
          currentUsage: 0,
          remaining: isUnlimited ? 999999 : (isNaN(numericLimit) ? 0 : numericLimit),
          usagePercentage: 0,
          unit: pf.feature?.unit || null,
          isAvailable: true,
        });
      }
    }

    return {
      subscription,
      usages,
      quotaSummary,
    };
  }
}
