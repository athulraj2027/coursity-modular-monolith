import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Note name cannot be empty").max(200, "Note name cannot exceed 200 characters"),
    description: z.string().max(10000).optional().nullable(),
    fileUrl: z.string().url("Invalid file URL"),
    fileKey: z.string().min(1, "fileKey is required"),
    fileType: z.string().min(1, "fileType is required"),
    fileExtension: z.string().optional().nullable(),
    fileSizeBytes: z.number().int().min(0).optional(),
    lectureId: z.string().uuid("Invalid lecture ID"),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Note name cannot be empty").max(200).optional(),
    description: z.string().max(10000).optional().nullable(),
    fileUrl: z.string().url().optional(),
    fileKey: z.string().optional(),
    fileType: z.string().optional(),
    fileExtension: z.string().optional().nullable(),
    fileSizeBytes: z.number().int().min(0).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const noteQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    courseId: z.string().uuid().optional(),
    lectureId: z.string().uuid().optional(),
    teacherProfileId: z.string().uuid().optional(),
    fileExtension: z.string().optional(),
    sort: z.enum(["created-desc", "created-asc", "name-asc", "name-desc"]).optional(),
  }),
});
