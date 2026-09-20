import { z } from "zod";

export const courseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]);
export const coursePricingTypeSchema = z.enum(["FREE", "PAID"]);
export const courseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "FROZEN"]);
export const lessonTypeSchema = z.enum(["VIDEO", "ARTICLE", "QUIZ", "LIVE_CLASS", "ATTACHMENT"]);
export const videoProviderSchema = z.enum(["LOCAL", "S3", "CLOUDFRONT", "YOUTUBE", "VIMEO", "MUX"]);

export const lessonAttachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  sizeBytes: z.number().int().nonnegative().optional(),
  type: z.string().optional(),
});

export const initialLessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  lessonType: lessonTypeSchema.default("VIDEO"),
  durationSeconds: z.number().int().nonnegative().default(0),
  sortOrder: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoProvider: videoProviderSchema.optional().nullable(),
  videoThumbnail: z.string().url().optional().nullable().or(z.literal("")),
  articleBody: z.string().max(50000).optional().nullable(),
  attachments: z.array(lessonAttachmentSchema).default([]),
});

export const initialModuleSchema = z.object({
  title: z.string().min(1, "Module title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().default(true),
  lessons: z.array(initialLessonSchema).optional().default([]),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  thumbnail: z.string().url().optional().nullable().or(z.literal("")),
  promoVideoUrl: z.string().url().optional().nullable().or(z.literal("")),
  startingDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null))
    .refine(
      (date) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date.getTime() >= today.getTime();
      },
      { message: "Starting date cannot be in the past." }
    ),
  level: courseLevelSchema.default("ALL_LEVELS"),
  language: z.string().default("English"),
  pricingType: coursePricingTypeSchema.default("FREE"),
  price: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  learningOutcomes: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().uuid("Invalid category ID"),
  subcategoryId: z.string().uuid("Invalid subcategory ID").optional().nullable(),
  status: courseStatusSchema.default("PUBLISHED"),
  modules: z.array(initialModuleSchema).optional().default([]),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  thumbnail: z.string().url().optional().nullable().or(z.literal("")),
  promoVideoUrl: z.string().url().optional().nullable().or(z.literal("")),
  startingDate: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
  level: courseLevelSchema.optional(),
  language: z.string().optional(),
  pricingType: coursePricingTypeSchema.optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional().nullable(),
  status: courseStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const createModuleSchema = z.object({
  title: z.string().min(2, "Module title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().default(true),
});

export const updateModuleSchema = createModuleSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(2, "Lesson title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional().nullable(),
  lessonType: lessonTypeSchema.default("VIDEO"),
  durationSeconds: z.number().int().nonnegative().default(0),
  sortOrder: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoProvider: videoProviderSchema.optional().nullable(),
  videoThumbnail: z.string().url().optional().nullable().or(z.literal("")),
  articleBody: z.string().max(50000).optional().nullable(),
  attachments: z.array(lessonAttachmentSchema).default([]),
});

export const updateLessonSchema = createLessonSchema.partial();

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int().min(0),
    })
  ).min(1),
});

export const adminDelistCourseSchema = z.object({
  reason: z.string().min(5, "Delist message/reason must be at least 5 characters").max(2000),
});

export const adminFreezeCourseSchema = z.object({
  reason: z.string().min(5, "Freeze message/reason must be at least 5 characters").max(2000),
});

export const queryCoursesSchema = z.object({
  search: z.string().optional(),
  teacherProfileId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  level: courseLevelSchema.optional(),
  pricingType: coursePricingTypeSchema.optional(),
  language: z.string().optional(),
  status: courseStatusSchema.optional(),
  isFeatured: z
    .string()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
  isTrending: z
    .string()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
  isFrozen: z
    .string()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
  isDeleted: z
    .string()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .optional(),
  includeDeleted: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
  sortBy: z
    .enum(["sortOrder", "createdAt", "price", "totalDurationSeconds", "totalLessons", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type QueryCoursesInput = z.infer<typeof queryCoursesSchema>;
export type AdminDelistCourseInput = z.infer<typeof adminDelistCourseSchema>;
export type AdminFreezeCourseInput = z.infer<typeof adminFreezeCourseSchema>;
