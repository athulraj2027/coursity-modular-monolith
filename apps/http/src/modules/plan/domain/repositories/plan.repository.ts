import { Plan, Feature } from "../entities/plan.entity";
import { CreatePlanDto, UpdatePlanDto } from "../dtos/plan.dto";

/**
 * Segregated query repository for reading plans
 */
export interface IPlanQueryRepository {
  findAll(includeInactive?: boolean): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findBySlug(slug: string): Promise<Plan | null>;
}

/**
 * Segregated repository for querying the dynamic feature catalog
 */
export interface IFeatureQueryRepository {
  findAllFeatures(): Promise<Feature[]>;
  findFeatureByCode(code: string): Promise<Feature | null>;
}

/**
 * Segregated repository for administrative plan management (CRUD)
 */
export interface IAdminPlanRepository {
  create(data: CreatePlanDto): Promise<Plan>;
  update(id: string, data: UpdatePlanDto): Promise<Plan>;
  delete(id: string): Promise<boolean>;
}

/**
 * Unified Plan Repository Interface (ISP Aggregator)
 */
export interface IPlanRepository
  extends IPlanQueryRepository,
    IFeatureQueryRepository,
    IAdminPlanRepository {}

/**
 * Backward compatibility alias
 */
export type PlanRepository = IPlanRepository;
