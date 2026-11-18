import { IAdminSubscriptionRepository } from "../../domain/repositories/subscription.repository";
import {
  AdminSubscriptionFilterDto,
  AdminSubscriptionListItem,
  AdminSubscriptionMetrics,
} from "../../domain/dtos/subscription.dto";

export class AdminGetSubscriptionsUseCase {
  constructor(private readonly subscriptionRepo: IAdminSubscriptionRepository) {}

  async execute(filter: AdminSubscriptionFilterDto): Promise<{
    items: AdminSubscriptionListItem[];
    total: number;
    metrics: AdminSubscriptionMetrics;
  }> {
    return this.subscriptionRepo.adminFindAll(filter);
  }
}
