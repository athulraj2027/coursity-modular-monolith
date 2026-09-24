import { WishlistEntity, WishlistItemEntity } from "../entities/wishlist.entity";
import { GetUserWishlistDTO, PaginatedWishlistResultDTO } from "../dtos/wishlist.dto";

export interface IWishlistRepository {
  /**
   * Find or create a user's parent wishlist container
   */
  getOrCreateWishlist(userId: string): Promise<WishlistEntity>;

  /**
   * Find a user's wishlist container by user ID
   */
  findWishlistByUserId(userId: string): Promise<WishlistEntity | null>;

  /**
   * Get all course IDs in a user's wishlist for fast cache/lookup
   */
  getWishlistCourseIds(userId: string): Promise<string[]>;

  /**
   * Get paginated wishlist items with full course details
   */
  getUserWishlistItems(dto: GetUserWishlistDTO): Promise<PaginatedWishlistResultDTO>;

  /**
   * Check if a specific course is in a user's wishlist
   */
  isCourseWishlisted(userId: string, courseId: string): Promise<boolean>;

  /**
   * Add a course to a user's wishlist
   */
  addItem(wishlistId: string, courseId: string): Promise<WishlistItemEntity>;

  /**
   * Remove a specific course from a user's wishlist
   */
  removeItem(wishlistId: string, courseId: string): Promise<boolean>;

  /**
   * Remove all courses from a user's wishlist
   */
  clearWishlist(wishlistId: string): Promise<number>;
}
