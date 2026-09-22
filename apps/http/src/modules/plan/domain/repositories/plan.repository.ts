import { Plan, Feature } from "../entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../dtos/plan.dto";

export interface PlanRepository {
  findAll(includeInactive?: boolean): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findBySlug(slug: string): Promise<Plan | null>;
  create(data: CreatePlanDto): Promise<Plan>;
  update(id: string, data: UpdatePlanDto): Promise<Plan>;
  delete(id: string): Promise<boolean>;
  findAllFeatures(): Promise<Feature[]>;
  findFeatureByCode(code: string): Promise<Feature | null>;
}
