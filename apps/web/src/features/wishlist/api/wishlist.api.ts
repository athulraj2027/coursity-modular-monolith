import { apiClient } from "@/lib/api-client";
import type {
  WishlistPaginatedResponse,
  ToggleWishlistResponse,
  WishlistQueryParams,
} from "../types/wishlist.types";

export const wishlistApi = {
  /**
   * Fetch paginated wishlist items with full course metadata
   */
  getWishlist: async (params?: WishlistQueryParams): Promise<WishlistPaginatedResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.sortBy) query.append("sortBy", params.sortBy);

    const queryString = query.toString();
    const res = await apiClient<{ success: boolean; data: WishlistPaginatedResponse }>(
      `/wishlist${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Fetch array of all wishlisted course IDs for global instant UI state
   */
  getWishlistIds: async (): Promise<string[]> => {
    const res = await apiClient<{ success: boolean; data: string[] }>(
      "/wishlist/ids",
      { method: "GET" }
    );
    return res.data;
  },

  /**
   * Toggle a course in/out of the user's wishlist
   */
  toggleWishlist: async (courseId: string): Promise<ToggleWishlistResponse> => {
    const res = await apiClient<{ success: boolean; data: ToggleWishlistResponse; message?: string }>(
      "/wishlist/toggle",
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }
    );
    return res.data;
  },

  /**
   * Explicitly remove a course from the user's wishlist
   */
  removeItem: async (courseId: string): Promise<{ removed: boolean; courseId: string }> => {
    const res = await apiClient<{ success: boolean; data: { removed: boolean; courseId: string } }>(
      `/wishlist/${courseId}`,
      { method: "DELETE" }
    );
    return res.data;
  },

  /**
   * Clear all items in the user's wishlist
   */
  clearWishlist: async (): Promise<{ clearedCount: number }> => {
    const res = await apiClient<{ success: boolean; data: { clearedCount: number } }>(
      "/wishlist",
      { method: "DELETE" }
    );
    return res.data;
  },
};
