import {
  IPlanQueryRepository,
  IAdminPlanRepository,
} from "../../domain/repositories/plan.repository";
import { UpdatePlanDto } from "../../domain/dtos/plan.dto";
import { Plan } from "../../domain/entities/plan.entity";
import {
  PlanNotFoundError,
  PlanConflictError,
} from "../../domain/errors/plan.errors";
import {
  PlanSlugPolicy,
  PlanValidationPolicy,
} from "../../domain/policies";

export type AdminUpdatePlanRepository = IPlanQueryRepository & IAdminPlanRepository;

export class AdminUpdatePlanUseCase {
  constructor(private readonly planRepo: AdminUpdatePlanRepository) {}

  async execute(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const existing = await this.planRepo.findById(id);
    if (!existing) {
      throw new PlanNotFoundError(`Plan with id '${id}' not found.`);
    }

    // 1. Domain Validation Policy
    PlanValidationPolicy.validateUpdate(dto);

    let normalizedSlug: string | undefined = undefined;
    if (dto.slug !== undefined) {
      normalizedSlug = PlanSlugPolicy.normalizeSlug(dto.slug);
      if (normalizedSlug !== existing.slug) {
        const slugExists = await this.planRepo.findBySlug(normalizedSlug);
        if (slugExists && slugExists.id !== id) {
          throw new PlanConflictError(`A plan with slug '${normalizedSlug}' already exists.`);
        }
      }
    }

    return this.planRepo.update(id, {
      ...dto,
      name: dto.name !== undefined ? dto.name.trim() : undefined,
      slug: normalizedSlug,
      tagline: dto.tagline !== undefined ? (dto.tagline ? dto.tagline.trim() : null) : undefined,
      description:
        dto.description !== undefined ? (dto.description ? dto.description.trim() : null) : undefined,
    });
  }
}
