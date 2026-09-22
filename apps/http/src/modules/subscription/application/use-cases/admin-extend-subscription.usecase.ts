import { SubscriptionRepository } from "../../domain/repositories/subscription.repository";
import { AdminExtendSubscriptionDto } from "../../domain/dtos/subscription.dto";
import { TeacherSubscription } from "../../domain/entities/subscription.entity";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class AdminExtendSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async execute(dto: AdminExtendSubscriptionDto): Promise<TeacherSubscription> {
    const existing = await this.subscriptionRepo.findById(dto.subscriptionId);
    if (!existing) {
      throw new NotFoundError(`Subscription '${dto.subscriptionId}' not found.`);
    }

    let newPeriodEnd: Date;

    if (dto.newPeriodEnd) {
      newPeriodEnd = new Date(dto.newPeriodEnd);
    } else if (dto.daysToAdd && dto.daysToAdd > 0) {
      const currentEnd = new Date(existing.currentPeriodEnd);
      const baseDate = currentEnd > new Date() ? currentEnd : new Date();
      newPeriodEnd = new Date(baseDate.getTime() + dto.daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      throw new BadRequestError("Either daysToAdd or newPeriodEnd must be provided.");
    }

    return this.subscriptionRepo.adminExtendPeriod(dto.subscriptionId, newPeriodEnd);
  }
}
