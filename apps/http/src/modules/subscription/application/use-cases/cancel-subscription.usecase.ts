import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";

export class CancelSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(teacherProfileId: string, immediate = false): Promise<TeacherSubscription> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);
    if (!activeSub) {
      throw new Error("No active subscription found to cancel.");
    }

    if (immediate) {
      return this.subscriptionRepo.updateStatus(activeSub.id, "CANCELED", new Date());
    }

    return this.subscriptionRepo.cancelAtPeriodEnd(activeSub.id, true);
  }
}
