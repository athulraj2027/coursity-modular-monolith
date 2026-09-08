import { z } from "zod";
import { STORAGE_FOLDERS, ALL_ALLOWED_MIME_TYPES } from "../../domain/entities/storage.entity";

export const getPresignedUrlSchema = z.object({
    fileName: z
        .string()
        .min(1, "fileName cannot be empty")
        .max(255, "fileName cannot exceed 255 characters"),
    fileType: z
        .string()
        .refine(
            (val) => ALL_ALLOWED_MIME_TYPES.includes(val.toLowerCase() as any),
            {
                message: "Unsupported fileType. Allowed types: JPEG, PNG, WebP, GIF, SVG, PDF",
            }
        ),
    folder: z
        .enum(STORAGE_FOLDERS, {
            message: `folder must be one of: ${STORAGE_FOLDERS.join(", ")}`,
        })
        .optional()
        .default("avatars"),
    fileSize: z
        .number()
        .positive("fileSize must be a positive integer")
        .max(25 * 1024 * 1024, "fileSize cannot exceed 25MB")
        .optional(),
});

export const deleteFileSchema = z.object({
    key: z.string().optional(),
    fileUrl: z.string().optional(),
}).refine((data) => data.key || data.fileUrl, {
    message: "Either 'key' or 'fileUrl' must be provided",
});

export type GetPresignedUrlInput = z.infer<typeof getPresignedUrlSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
