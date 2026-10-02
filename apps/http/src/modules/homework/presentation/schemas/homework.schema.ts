import { z } from "zod";

export const createHomeworkSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Homework title cannot be empty")
      .max(200, "Homework title cannot exceed 200 characters"),
    description: z.string().max(20000).optional().nullable(),
    taskContent: z.string().max(50000).optional().nullable(),
    taskUrl: z.string().url("Invalid task URL").optional().nullable().or(z.literal("")),
    attachmentUrl: z.string().url("Invalid attachment URL").optional().nullable().or(z.literal("")),
    attachmentKey: z.string().optional().nullable(),
    attachmentName: z.string().optional().nullable(),
    attachmentType: z.string().optional().nullable(),
    attachmentSize: z.number().int().min(0).optional(),
    dueDate: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
    maxScore: z.number().int().min(1).max(1000).optional(),
    lectureId: z.string().uuid("Invalid lecture ID"),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const updateHomeworkSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Homework title cannot be empty").max(200).optional(),
    description: z.string().max(20000).optional().nullable(),
    taskContent: z.string().max(50000).optional().nullable(),
    taskUrl: z.string().url("Invalid task URL").optional().nullable().or(z.literal("")),
    attachmentUrl: z.string().url("Invalid attachment URL").optional().nullable().or(z.literal("")),
    attachmentKey: z.string().optional().nullable(),
    attachmentName: z.string().optional().nullable(),
    attachmentType: z.string().optional().nullable(),
    attachmentSize: z.number().int().min(0).optional(),
    dueDate: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
    maxScore: z.number().int().min(1).max(1000).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const submitHomeworkSchema = z.object({
  body: z.object({
    submissionText: z.string().max(50000).optional().nullable(),
    submissionUrl: z.string().url("Invalid project URL").optional().nullable().or(z.literal("")),
    fileUrl: z.string().url("Invalid submission file URL").optional().nullable().or(z.literal("")),
    fileKey: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    fileType: z.string().optional().nullable(),
    fileSizeBytes: z.number().int().min(0).optional(),
  }),
});

export const reviewSubmissionSchema = z.object({
  body: z.object({
    verificationStatus: z.enum(["VERIFIED", "REDO"]),
    feedback: z.string().max(10000).optional().nullable(),
    score: z.number().int().min(0).max(1000).optional().nullable(),
  }),
});

export const homeworkQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    courseId: z.string().uuid().optional(),
    lectureId: z.string().uuid().optional(),
    teacherProfileId: z.string().uuid().optional(),
    sort: z.enum(["created-desc", "created-asc", "title-asc", "title-desc", "due-asc", "due-desc"]).optional(),
  }),
});
