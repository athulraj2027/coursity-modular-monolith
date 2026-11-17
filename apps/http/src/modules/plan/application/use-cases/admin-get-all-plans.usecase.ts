import { IPlanQueryRepository } from "../../domain/repositories/plan.repository";
import { Plan } from "../../domain/entities/plan.entity";

export class AdminGetAllPlansUseCase {
  constructor(private readonly planRepo: IPlanQueryRepository) {}

  async execute(): Promise<Plan[]> {
    return this.planRepo.findAll(true);
  }
}
