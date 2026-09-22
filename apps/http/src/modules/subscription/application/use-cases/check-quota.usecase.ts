import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { QuotaEvaluationResult } from "../../domain/entities/subscription.entity";

export class CheckQuotaUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(
    teacherProfileId: string,
    featureCode: string,
    requestedAmount = 1
  ): Promise<QuotaEvaluationResult> {
    return this.subscriptionRepo.evaluateQuota(teacherProfileId, featureCode, requestedAmount);
  }
}
