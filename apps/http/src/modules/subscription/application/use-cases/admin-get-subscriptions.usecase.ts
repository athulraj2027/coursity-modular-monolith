import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import {
  AdminSubscriptionFilterDto,
  AdminSubscriptionListItem,
  AdminSubscriptionMetrics,
} from "../../domain/dtos/subscription.dto";

export class AdminGetSubscriptionsUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(filter: AdminSubscriptionFilterDto): Promise<{
    items: AdminSubscriptionListItem[];
    total: number;
    metrics: AdminSubscriptionMetrics;
  }> {
    return this.subscriptionRepo.adminFindAll(filter);
  }
}
