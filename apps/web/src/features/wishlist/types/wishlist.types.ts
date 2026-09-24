import type { Course } from "@/features/course/types/course.types";

export interface WishlistItem {
  id: string;
  wishlistId: string;
  courseId: string;
  createdAt: string;
  course: Course;
}

export interface WishlistPaginatedResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ToggleWishlistResponse {
  isWishlisted: boolean;
  courseId: string;
  wishlistId: string;
  item: WishlistItem | null;
}

export interface WishlistQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
}
