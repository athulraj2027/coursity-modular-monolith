import { z } from "zod";
import { STORAGE_FOLDERS, ALL_ALLOWED_MIME_TYPES } from "../../entities/storage.entity";

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
                message: "Unsupported fileType. Allowed types: JPEG, PNG, WebP, GIF, SVG, PDF, MP4, WebM, MOV, MKV",
            }
        ),
    folder: z
        .enum(STORAGE_FOLDERS, {
            message: `folder must be one of: ${STORAGE_FOLDERS.join(", ")}`,
        })
        .optional()
        .default("avatars"),
    fileSize: z
        .coerce
        .number()
        .min(0, "fileSize cannot be negative")
        .max(500 * 1024 * 1024, "fileSize cannot exceed 500MB")
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
