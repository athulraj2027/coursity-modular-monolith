import {
  IPlanQueryRepository,
  IAdminPlanRepository,
} from "../../domain/repositories/plan.repository";
import { CreatePlanDto } from "../../domain/dtos/plan.dto";
import { Plan } from "../../domain/entities/plan.entity";
import { PlanConflictError } from "../../domain/errors/plan.errors";
import {
  PlanSlugPolicy,
  PlanValidationPolicy,
} from "../../domain/policies";

export type AdminCreatePlanRepository = IPlanQueryRepository & IAdminPlanRepository;

export class AdminCreatePlanUseCase {
  constructor(private readonly planRepo: AdminCreatePlanRepository) {}

  async execute(dto: CreatePlanDto): Promise<Plan> {
    // 1. Domain Validation Policy
    PlanValidationPolicy.validateCreation(dto);

    const normalizedSlug = PlanSlugPolicy.normalizeSlug(dto.slug);

    // 2. Uniqueness check
    const existing = await this.planRepo.findBySlug(normalizedSlug);
    if (existing) {
      throw new PlanConflictError(`A plan with slug '${normalizedSlug}' already exists.`);
    }

    return this.planRepo.create({
      ...dto,
      name: dto.name.trim(),
      slug: normalizedSlug,
      tagline: dto.tagline ? dto.tagline.trim() : null,
      description: dto.description ? dto.description.trim() : null,
    });
  }
}
