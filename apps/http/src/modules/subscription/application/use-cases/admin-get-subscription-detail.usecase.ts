import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { NotFoundError } from "@/app/errors";

export class AdminGetSubscriptionDetailUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(id: string): Promise<any> {
    const detail = await this.subscriptionRepo.adminFindById(id);
    if (!detail) {
      throw new NotFoundError(`Subscription with ID '${id}' was not found.`);
    }
    return detail;
  }
}
