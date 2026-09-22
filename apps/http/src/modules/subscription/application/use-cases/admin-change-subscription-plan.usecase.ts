import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { PlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { AdminChangeSubscriptionPlanDto } from "../../domain/dtos/subscription.dto";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { NotFoundError } from "@/app/errors";

export class AdminChangeSubscriptionPlanUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: PlanRepository
  ) {}

  async execute(dto: AdminChangeSubscriptionPlanDto): Promise<TeacherSubscription> {
    const existing = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!existing) {
      throw new NotFoundError(`Subscription '${dto.subscriptionId}' not found.`);
    }

    const newPlan = await this.planRepo.findById(dto.newPlanId);
    if (!newPlan) {
      throw new NotFoundError(`Target plan '${dto.newPlanId}' does not exist.`);
    }

    const now = new Date();
    let periodEnd = existing.currentPeriodEnd;

    if (dto.resetPeriod) {
      periodEnd = new Date(now);
      if (newPlan.billingCycle === "YEARLY") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else if (newPlan.billingCycle === "QUARTERLY") {
        periodEnd.setMonth(periodEnd.getMonth() + 3);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    }

    return this.subscriptionRepo.changePlan(
      dto.subscriptionId,
      newPlan.id,
      now,
      periodEnd
    );
  }
}
