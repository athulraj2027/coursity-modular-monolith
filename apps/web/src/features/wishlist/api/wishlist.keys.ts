import type { WishlistQueryParams } from "../types/wishlist.types";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  lists: () => [...wishlistKeys.all, "list"] as const,
  list: (params?: WishlistQueryParams) => [...wishlistKeys.lists(), params ?? {}] as const,
  ids: () => [...wishlistKeys.all, "ids"] as const,
};
