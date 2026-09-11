import { SubscriptionRepository, UsageRepository } from "../../domain/repositories/plan.repository";
import { TeacherPlanUsage } from "../../domain/entities/plan.entity";
import { RecordUsageDto } from "../../domain/dtos/plan.dto";

export class RecordUsageUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly usageRepo: UsageRepository
  ) {}

  async execute(dto: RecordUsageDto): Promise<TeacherPlanUsage> {
    const activeSub = await this.subscriptionRepo.findActiveByTeacherId(dto.teacherProfileId);
    if (!activeSub) {
      throw new Error("Cannot record usage: No active subscription found for teacher.");
    }

    const isIncrement = dto.setAbsoluteValue === undefined;
    const amount = isIncrement ? dto.incrementBy || 1 : dto.setAbsoluteValue || 0;

    return this.usageRepo.recordUsage({
      subscriptionId: activeSub.id,
      teacherProfileId: dto.teacherProfileId,
      featureCode: dto.featureCode,
      amount,
      periodStart: activeSub.currentPeriodStart,
      periodEnd: activeSub.currentPeriodEnd,
      isIncrement,
    });
  }
}
