import { WishlistItemEntity } from "../entities/wishlist.entity";

export interface ToggleWishlistDTO {
  userId: string;
  courseId: string;
}

export interface ToggleWishlistResultDTO {
  isWishlisted: boolean;
  courseId: string;
  wishlistId: string;
  item?: WishlistItemEntity | null;
}

export interface GetUserWishlistDTO {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
}

export interface PaginatedWishlistResultDTO {
  items: WishlistItemEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
