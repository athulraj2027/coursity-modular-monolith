import { IAdminSubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { SubscriptionNotFoundError } from "../../domain/errors/subscription.errors";

export class AdminGetSubscriptionDetailUseCase {
  constructor(private readonly subscriptionRepo: IAdminSubscriptionRepository) {}

  async execute(id: string): Promise<any> {
    const detail = await this.subscriptionRepo.adminFindById(id);
    if (!detail) {
      throw new SubscriptionNotFoundError(`Subscription with ID '${id}' was not found.`);
    }
    return detail;
  }
}
