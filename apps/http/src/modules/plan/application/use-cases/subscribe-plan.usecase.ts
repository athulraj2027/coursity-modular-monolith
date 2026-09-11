import { SubscriptionRepository, PlanRepository } from "../../domain/repositories/plan.repository";
import { TeacherSubscription } from "../../domain/entities/plan.entity";
import { SubscribePlanDto } from "../../domain/dtos/plan.dto";

export class SubscribePlanUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(dto: SubscribePlanDto): Promise<TeacherSubscription> {
    const targetPlan = await this.planRepo.findById(dto.planId);
    if (!targetPlan) {
      throw new Error(`Plan with id '${dto.planId}' not found.`);
    }

    if (!targetPlan.isActive) {
      throw new Error(`Plan '${targetPlan.name}' is currently not active for new subscriptions.`);
    }

    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(dto.teacherProfileId);

    const now = new Date();
    const periodEnd = new Date(now);

    if (targetPlan.billingCycle === "YEARLY") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else if (targetPlan.billingCycle === "QUARTERLY") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    let trialEndsAt: Date | null = null;
    if (targetPlan.trialDays > 0 && (!activeSub || activeSub.status !== "ACTIVE")) {
      trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + targetPlan.trialDays);
    }

    if (activeSub) {
      // Upgrade / Change existing active subscription to the new plan
      return this.subscriptionRepo.changePlan(
        activeSub.id,
        targetPlan.id,
        now,
        periodEnd
      );
    }

    // Create brand new subscription
    return this.subscriptionRepo.create({
      teacherProfileId: dto.teacherProfileId,
      planId: targetPlan.id,
      status: trialEndsAt ? "TRIALING" : "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      externalCustomerId: dto.externalCustomerId,
      externalSubscriptionId: dto.externalSubscriptionId,
    });
  }
}
