import { PlanRepository } from "../../domain/repositories/plan.repository";
import { Plan, Feature } from "../../domain/entities/plan.entity";

export class GetPlansUseCase {
  constructor(private readonly planRepo: PlanRepository) {}

  async execute(includeInactive = false): Promise<{ plans: Plan[]; features: Feature[] }> {
    const [plans, features] = await Promise.all([
      this.planRepo.findAll(includeInactive),
      this.planRepo.findAllFeatures(),
    ]);

    return { plans, features };
  }
}
