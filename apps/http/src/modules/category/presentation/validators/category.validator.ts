import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(100).optional().nullable(),
  image: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
  parentId: z.string().uuid("Invalid parent ID").optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const queryCategoriesSchema = z.object({
  search: z.string().optional(),
  parentId: z.string().optional().nullable(),
  onlyParents: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isActive: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  isFeatured: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  isDeleted: z
    .string()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined))
    .optional(),
  includeDeleted: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  sortBy: z.enum(["sortOrder", "name", "createdAt", "updatedAt"]).default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type QueryCategoriesInput = z.infer<typeof queryCategoriesSchema>;
