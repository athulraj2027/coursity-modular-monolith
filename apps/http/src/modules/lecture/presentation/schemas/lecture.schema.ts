import { z } from "zod";

export const liveClassStatusSchema = z.enum(["SCHEDULED", "LIVE_NOW", "COMPLETED", "CANCELLED"]);

export const createLectureSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid course ID"),
    moduleId: z.string().uuid("Invalid module ID").optional(),
    title: z.string().min(2, "Lecture title must be at least 2 characters").max(200),
    description: z.string().max(10000).optional().nullable(),
    scheduledAt: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
    durationSeconds: z.number().int().min(60, "Duration must be at least 1 minute").default(3600),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const updateLectureSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Lecture title must be at least 2 characters").max(200).optional(),
    description: z.string().max(10000).optional().nullable(),
    scheduledAt: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
    durationSeconds: z.number().int().min(60).optional(),
    liveStatus: liveClassStatusSchema.optional(),
    isLiveNow: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const lectureQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    courseId: z.string().uuid().optional(),
    teacherProfileId: z.string().uuid().optional(),
    status: z.string().optional(),
    sort: z.enum(["startTime-asc", "startTime-desc", "created-desc", "created-asc", "title-asc"]).optional(),
  }),
});
