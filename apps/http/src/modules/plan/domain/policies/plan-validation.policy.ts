import { CreatePlanDto, UpdatePlanDto } from "../dtos/plan.dto";
import { PlanValidationError } from "../errors/plan.errors";
import { PlanSlugPolicy } from "./plan-slug.policy";

export class PlanValidationPolicy {
  public static readonly MIN_NAME_LENGTH = 2;
  public static readonly MAX_NAME_LENGTH = 100;
  public static readonly MAX_TAGLINE_LENGTH = 255;
  public static readonly MAX_DESCRIPTION_LENGTH = 1000;

  public static readonly ALLOWED_BILLING_CYCLES = new Set([
    "MONTHLY",
    "QUARTERLY",
    "YEARLY",
    "LIFETIME",
  ]);

  /**
   * Validates plan creation payload
   */
  static validateCreation(dto: CreatePlanDto): void {
    if (!dto.name || !dto.name.trim()) {
      throw new PlanValidationError("Plan name is required.");
    }

    const trimmedName = dto.name.trim();
    if (trimmedName.length < this.MIN_NAME_LENGTH) {
      throw new PlanValidationError(
        `Plan name must be at least ${this.MIN_NAME_LENGTH} characters.`
      );
    }
    if (trimmedName.length > this.MAX_NAME_LENGTH) {
      throw new PlanValidationError(
        `Plan name cannot exceed ${this.MAX_NAME_LENGTH} characters.`
      );
    }

    PlanSlugPolicy.validateSlug(dto.slug);

    if (dto.tagline && dto.tagline.length > this.MAX_TAGLINE_LENGTH) {
      throw new PlanValidationError(
        `Tagline cannot exceed ${this.MAX_TAGLINE_LENGTH} characters.`
      );
    }

    if (dto.description && dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new PlanValidationError(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    if (dto.price === undefined || dto.price === null || Number(dto.price) < 0) {
      throw new PlanValidationError("Price cannot be negative.");
    }

    if (dto.billingCycle && !this.ALLOWED_BILLING_CYCLES.has(dto.billingCycle)) {
      throw new PlanValidationError(`Invalid billing cycle '${dto.billingCycle}'.`);
    }

    if (dto.trialDays !== undefined && Number(dto.trialDays) < 0) {
      throw new PlanValidationError("Trial days cannot be negative.");
    }
  }

  /**
   * Validates plan update payload
   */
  static validateUpdate(dto: UpdatePlanDto): void {
    if (dto.name !== undefined) {
      if (!dto.name || !dto.name.trim()) {
        throw new PlanValidationError("Plan name cannot be empty.");
      }
      const trimmedName = dto.name.trim();
      if (trimmedName.length < this.MIN_NAME_LENGTH) {
        throw new PlanValidationError(
          `Plan name must be at least ${this.MIN_NAME_LENGTH} characters.`
        );
      }
      if (trimmedName.length > this.MAX_NAME_LENGTH) {
        throw new PlanValidationError(
          `Plan name cannot exceed ${this.MAX_NAME_LENGTH} characters.`
        );
      }
    }

    if (dto.slug !== undefined) {
      PlanSlugPolicy.validateSlug(dto.slug);
    }

    if (dto.tagline !== undefined && dto.tagline !== null && dto.tagline.length > this.MAX_TAGLINE_LENGTH) {
      throw new PlanValidationError(
        `Tagline cannot exceed ${this.MAX_TAGLINE_LENGTH} characters.`
      );
    }

    if (dto.description !== undefined && dto.description !== null && dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new PlanValidationError(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    if (dto.price !== undefined && Number(dto.price) < 0) {
      throw new PlanValidationError("Price cannot be negative.");
    }

    if (dto.billingCycle && !this.ALLOWED_BILLING_CYCLES.has(dto.billingCycle)) {
      throw new PlanValidationError(`Invalid billing cycle '${dto.billingCycle}'.`);
    }

    if (dto.trialDays !== undefined && Number(dto.trialDays) < 0) {
      throw new PlanValidationError("Trial days cannot be negative.");
    }
  }
}
