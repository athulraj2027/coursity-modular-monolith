import { PlanRepository } from "../../domain/repositories/plan.repository";
import { Plan, Feature } from "../../domain/entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../../domain/dtos/plan.dto";

export class AdminManagePlansUseCase {
  constructor(private readonly planRepo: PlanRepository) {}

  async getAllPlans(): Promise<Plan[]> {
    return this.planRepo.findAll(true);
  }

  async getAllFeatures(): Promise<Feature[]> {
    return this.planRepo.findAllFeatures();
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.planRepo.findById(id);
  }

  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    const existing = await this.planRepo.findBySlug(dto.slug);
    if (existing) {
      throw new Error(`A plan with slug '${dto.slug}' already exists.`);
    }
    return this.planRepo.create(dto);
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const existing = await this.planRepo.findById(id);
    if (!existing) {
      throw new Error(`Plan with id '${id}' not found.`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.planRepo.findBySlug(dto.slug);
      if (slugExists) {
        throw new Error(`A plan with slug '${dto.slug}' already exists.`);
      }
    }

    return this.planRepo.update(id, dto);
  }

  async deletePlan(id: string): Promise<boolean> {
    return this.planRepo.delete(id);
  }
}
