import { WishlistLimitExceededError } from "../errors/wishlist.errors";

export class WishlistPolicy {
  public static readonly MAX_WISHLIST_CAPACITY = 100;
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_LIMIT = 12;
  public static readonly MAX_LIMIT = 50;
  public static readonly ALLOWED_SORT_OPTIONS = [
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
  ] as const;

  public static validateCapacity(currentCount: number): void {
    if (currentCount >= this.MAX_WISHLIST_CAPACITY) {
      throw new WishlistLimitExceededError(
        `Wishlist capacity limit reached (max ${this.MAX_WISHLIST_CAPACITY} courses)`
      );
    }
  }

  public static normalizePagination(
    page?: number,
    limit?: number
  ): { page: number; limit: number } {
    const normalizedPage = Math.max(this.DEFAULT_PAGE, page || this.DEFAULT_PAGE);
    const normalizedLimit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, limit || this.DEFAULT_LIMIT)
    );
    return { page: normalizedPage, limit: normalizedLimit };
  }

  public static formatToggleMessage(isWishlisted: boolean): string {
    return isWishlisted
      ? "Course added to your wishlist"
      : "Course removed from your wishlist";
  }
}
