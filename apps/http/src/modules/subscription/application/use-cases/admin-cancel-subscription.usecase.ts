import { ISubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { AdminCancelSubscriptionDto } from "../../domain/dtos/subscription.dto";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { SubscriptionNotFoundError } from "../../domain/errors/subscription.errors";

export class AdminCancelSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  async execute(dto: AdminCancelSubscriptionDto): Promise<TeacherSubscription> {
    const existing = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError(`Subscription '${dto.subscriptionId}' not found.`);
    }

    if (dto.immediate) {
      return this.subscriptionRepo.updateStatus(dto.subscriptionId, "CANCELED", new Date());
    }

    return this.subscriptionRepo.cancelAtPeriodEnd(dto.subscriptionId, true);
  }
}
