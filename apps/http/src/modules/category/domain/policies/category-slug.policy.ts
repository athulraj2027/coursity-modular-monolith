import { BadRequestError } from "@/app/errors";

export class CategorySlugPolicy {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  /**
   * Generates a URL-friendly, sanitized slug from a human-readable name.
   */
  static generate(name: string): string {
    if (!name || typeof name !== "string") {
      throw new BadRequestError("Category name is required to generate a slug.");
    }

    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, "-")  // replace spaces, underscores, multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // trim leading and trailing hyphens
  }

  /**
   * Validates whether a slug matches the allowed URL format.
   */
  static isValid(slug: string): boolean {
    if (!slug || typeof slug !== "string") {
      return false;
    }
    return this.SLUG_REGEX.test(slug);
  }

  /**
   * Normalizes a user-supplied slug.
   */
  static normalize(slug: string): string {
    return slug ? slug.trim().toLowerCase() : "";
  }
}

