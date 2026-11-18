import { ISubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { SubscriptionNotFoundError } from "../../domain/errors/subscription.errors";

export class CancelSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  async execute(teacherProfileId: string, immediate = false): Promise<TeacherSubscription> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);
    if (!activeSub) {
      throw new SubscriptionNotFoundError("No active subscription found to cancel.");
    }

    if (immediate) {
      return this.subscriptionRepo.updateStatus(activeSub.id, "CANCELED", new Date());
    }

    return this.subscriptionRepo.cancelAtPeriodEnd(activeSub.id, true);
  }
}
