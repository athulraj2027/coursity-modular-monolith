import { SubscriptionRepository } from "../../domain/repositories/plan.repository";
import { TeacherSubscription } from "../../domain/entities/plan.entity";

export class CancelSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(teacherProfileId: string, immediate = false): Promise<TeacherSubscription> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(teacherProfileId);
    if (!activeSub) {
      throw new Error("No active subscription found to cancel.");
    }

    if (immediate) {
      return this.subscriptionRepo.updateStatus(activeSub.id, "CANCELED", {
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      });
    }

    // Default: Mark to cancel at period end so teacher retains access until billing cycle concludes
    return this.subscriptionRepo.updateStatus(activeSub.id, "ACTIVE", {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    });
  }
}
