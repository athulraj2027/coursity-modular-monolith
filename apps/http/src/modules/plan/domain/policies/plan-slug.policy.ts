import { PlanValidationError } from "../errors/plan.errors";

export class PlanSlugPolicy {
  public static readonly SLUG_REGEX = /^[a-z0-9-]+$/;
  public static readonly MIN_SLUG_LENGTH = 2;
  public static readonly MAX_SLUG_LENGTH = 100;

  /**
   * Generates a URL-friendly slug from a plan name
   */
  static generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Normalizes a slug string
   */
  static normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  /**
   * Validates a slug against format and length constraints
   */
  static validateSlug(slug: string): void {
    if (!slug || !slug.trim()) {
      throw new PlanValidationError("Plan slug is required.");
    }

    const normalized = this.normalizeSlug(slug);

    if (normalized.length < this.MIN_SLUG_LENGTH) {
      throw new PlanValidationError(
        `Plan slug must be at least ${this.MIN_SLUG_LENGTH} characters.`
      );
    }

    if (normalized.length > this.MAX_SLUG_LENGTH) {
      throw new PlanValidationError(
        `Plan slug cannot exceed ${this.MAX_SLUG_LENGTH} characters.`
      );
    }

    if (!this.SLUG_REGEX.test(normalized)) {
      throw new PlanValidationError(
        "Plan slug must only contain lowercase alphanumeric characters and hyphens."
      );
    }
  }
}
