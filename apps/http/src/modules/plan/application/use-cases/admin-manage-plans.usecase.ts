import { IPlanRepository } from "../../domain/repositories/plan.repository";
import { Plan, Feature } from "../../domain/entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../../domain/dtos/plan.dto";
import { AdminCreatePlanUseCase } from "./admin-create-plan.usecase";
import { AdminUpdatePlanUseCase } from "./admin-update-plan.usecase";
import { AdminDeletePlanUseCase } from "./admin-delete-plan.usecase";
import { AdminGetAllPlansUseCase } from "./admin-get-all-plans.usecase";
import { AdminGetAllFeaturesUseCase } from "./admin-get-all-features.usecase";
import { GetPlanByIdUseCase } from "./get-plan-by-id.usecase";

/**
 * Backward compatibility facade delegating to focused use cases
 */
export class AdminManagePlansUseCase {
  private readonly adminCreatePlanUseCase: AdminCreatePlanUseCase;
  private readonly adminUpdatePlanUseCase: AdminUpdatePlanUseCase;
  private readonly adminDeletePlanUseCase: AdminDeletePlanUseCase;
  private readonly adminGetAllPlansUseCase: AdminGetAllPlansUseCase;
  private readonly adminGetAllFeaturesUseCase: AdminGetAllFeaturesUseCase;
  private readonly getPlanByIdUseCase: GetPlanByIdUseCase;

  constructor(private readonly planRepo: IPlanRepository) {
    this.adminCreatePlanUseCase = new AdminCreatePlanUseCase(planRepo);
    this.adminUpdatePlanUseCase = new AdminUpdatePlanUseCase(planRepo);
    this.adminDeletePlanUseCase = new AdminDeletePlanUseCase(planRepo);
    this.adminGetAllPlansUseCase = new AdminGetAllPlansUseCase(planRepo);
    this.adminGetAllFeaturesUseCase = new AdminGetAllFeaturesUseCase(planRepo);
    this.getPlanByIdUseCase = new GetPlanByIdUseCase(planRepo);
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.adminGetAllPlansUseCase.execute();
  }

  async getAllFeatures(): Promise<Feature[]> {
    return this.adminGetAllFeaturesUseCase.execute();
  }

  async getPlanById(id: string): Promise<Plan | null> {
    try {
      return await this.getPlanByIdUseCase.execute(id);
    } catch {
      return null;
    }
  }

  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    return this.adminCreatePlanUseCase.execute(dto);
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
    return this.adminUpdatePlanUseCase.execute(id, dto);
  }

  async deletePlan(id: string): Promise<boolean> {
    return this.adminDeletePlanUseCase.execute(id);
  }
}
