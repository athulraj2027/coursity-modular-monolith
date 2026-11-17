import { z } from "zod";

export const liveClassStatusSchema = z.enum(["SCHEDULED", "LIVE_NOW", "COMPLETED", "CANCELLED"]);

export const createLectureBodySchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  moduleId: z.string().uuid("Invalid module ID").optional(),
  title: z.string().min(2, "Lecture title must be at least 2 characters").max(200),
  description: z.string().max(10000).optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
  durationSeconds: z.number().int().min(60, "Duration must be at least 1 minute").default(3600),
  sortOrder: z.number().int().min(0).optional(),
});

export const createLectureSchema = z.object({
  body: createLectureBodySchema,
});

export type CreateLectureBody = z.infer<typeof createLectureBodySchema>;

export const updateLectureBodySchema = z.object({
  title: z.string().min(2, "Lecture title must be at least 2 characters").max(200).optional(),
  description: z.string().max(10000).optional().nullable(),
  scheduledAt: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
  durationSeconds: z.number().int().min(60).optional(),
  liveStatus: liveClassStatusSchema.optional(),
  isLiveNow: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateLectureSchema = z.object({
  body: updateLectureBodySchema,
});

export type UpdateLectureBody = z.infer<typeof updateLectureBodySchema>;

export const lectureQueryObjectSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  courseId: z.string().uuid().optional(),
  teacherProfileId: z.string().uuid().optional(),
  status: z.string().optional(),
  sort: z.enum(["startTime-asc", "startTime-desc", "created-desc", "created-asc", "title-asc"]).optional(),
});

export const lectureQuerySchema = z.object({
  query: lectureQueryObjectSchema,
});

export type LectureQueryParams = z.infer<typeof lectureQueryObjectSchema>;
