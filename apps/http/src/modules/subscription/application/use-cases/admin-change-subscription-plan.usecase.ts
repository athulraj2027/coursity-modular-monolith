import { ISubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { IPlanRepository } from "@/modules/plan/domain/repositories/plan.repository";
import { AdminChangeSubscriptionPlanDto } from "../../domain/dtos/subscription.dto";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { SubscriptionNotFoundError } from "../../domain/errors/subscription.errors";
import { SubscriptionPeriodPolicy } from "../../domain/policies";

export class AdminChangeSubscriptionPlanUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly planRepo: IPlanRepository
  ) {}

  async execute(dto: AdminChangeSubscriptionPlanDto): Promise<TeacherSubscription> {
    const existing = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError(`Subscription '${dto.subscriptionId}' not found.`);
    }

    const newPlan = await this.planRepo.findById(dto.newPlanId);
    if (!newPlan) {
      throw new SubscriptionNotFoundError(`Target plan '${dto.newPlanId}' does not exist.`);
    }

    const now = new Date();
    let periodEnd = existing.currentPeriodEnd;

    if (dto.resetPeriod) {
      periodEnd = SubscriptionPeriodPolicy.calculatePeriodEnd(now, newPlan.billingCycle);
    }

    return this.subscriptionRepo.changePlan(
      dto.subscriptionId,
      newPlan.id,
      now,
      periodEnd
    );
  }
}
