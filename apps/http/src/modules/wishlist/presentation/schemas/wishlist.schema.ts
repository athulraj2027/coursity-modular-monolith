import { z } from "zod";

export const toggleWishlistSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export const getUserWishlistQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
  search: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional().default("newest"),
});

export const removeWishlistItemParamsSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;
export type GetUserWishlistQueryInput = z.infer<typeof getUserWishlistQuerySchema>;
export type RemoveWishlistItemParamsInput = z.infer<typeof removeWishlistItemParamsSchema>;
