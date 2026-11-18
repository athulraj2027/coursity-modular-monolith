import {
  IPlanQueryRepository,
  IAdminPlanRepository,
} from "../../domain/repositories/plan.repository";
import { PlanNotFoundError } from "../../domain/errors/plan.errors";

export type AdminDeletePlanRepository = IPlanQueryRepository & IAdminPlanRepository;

export class AdminDeletePlanUseCase {
  constructor(private readonly planRepo: AdminDeletePlanRepository) {}

  async execute(id: string): Promise<boolean> {
    const existing = await this.planRepo.findById(id);
    if (!existing) {
      throw new PlanNotFoundError(`Plan with id '${id}' not found.`);
    }

    return this.planRepo.delete(id);
  }
}
