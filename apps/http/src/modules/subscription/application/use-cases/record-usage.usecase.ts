import {
  ISubscriptionRepository,
  ISubscriptionUsageRepository,
} from "../../domain/repositories/subscription.repository";
import { TeacherPlanUsage } from "../../domain/entities/subscription.entity";
import { SubscriptionUsageNotAllowedError } from "../../domain/errors/subscription.errors";

export class RecordUsageUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository & ISubscriptionUsageRepository
  ) {}

  async execute(
    teacherProfileId: string,
    featureCode: string,
    amount = 1,
    isAbsolute = false
  ): Promise<TeacherPlanUsage> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);
    if (!activeSub) {
      throw new SubscriptionUsageNotAllowedError(
        "Cannot record usage: No active subscription exists."
      );
    }

    return this.subscriptionRepo.recordUsage(
      activeSub.id,
      teacherProfileId,
      featureCode,
      activeSub.currentPeriodStart,
      activeSub.currentPeriodEnd,
      amount,
      isAbsolute
    );
  }
}
