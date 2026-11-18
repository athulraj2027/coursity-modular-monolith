import { IPlanQueryRepository } from "../../domain/repositories/plan.repository";
import { Plan } from "../../domain/entities/plan.entity";
import { PlanNotFoundError } from "../../domain/errors/plan.errors";

export class GetPlanByIdUseCase {
  constructor(private readonly planRepo: IPlanQueryRepository) {}

  async execute(id: string): Promise<Plan> {
    const plan = await this.planRepo.findById(id);
    if (!plan) {
      throw new PlanNotFoundError(`Plan with id '${id}' not found.`);
    }
    return plan;
  }
}
