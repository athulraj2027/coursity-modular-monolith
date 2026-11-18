import { ISubscriptionRepository, IAdminSubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { AdminExtendSubscriptionDto } from "../../domain/dtos/subscription.dto";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import {
  SubscriptionNotFoundError,
  SubscriptionValidationError,
} from "../../domain/errors/subscription.errors";
import { SubscriptionPeriodPolicy } from "../../domain/policies";

export class AdminExtendSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository & IAdminSubscriptionRepository
  ) {}

  async execute(dto: AdminExtendSubscriptionDto): Promise<TeacherSubscription> {
    const existing = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!existing) {
      throw new SubscriptionNotFoundError(`Subscription '${dto.subscriptionId}' not found.`);
    }

    if (!dto.newPeriodEnd && (!dto.daysToAdd || dto.daysToAdd <= 0)) {
      throw new SubscriptionValidationError(
        "Either positive daysToAdd or newPeriodEnd must be provided."
      );
    }

    const newPeriodEnd = SubscriptionPeriodPolicy.calculateExtension(
      existing.currentPeriodEnd,
      dto.daysToAdd,
      dto.newPeriodEnd
    );

    return this.subscriptionRepo.adminExtendPeriod(dto.subscriptionId, newPeriodEnd);
  }
}
