export const STORAGE_FOLDERS = [
    "avatars",
    "certificates",
    "courses",
    "thumbnails",
    "documents",
    "general",
] as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

export const ALLOWED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    "application/pdf",
] as const;

export const ALL_ALLOWED_MIME_TYPES = [
    ...ALLOWED_IMAGE_MIME_TYPES,
    ...ALLOWED_DOCUMENT_MIME_TYPES,
] as const;

export type AllowedMimeType = (typeof ALL_ALLOWED_MIME_TYPES)[number];

export interface PresignedUrlRequestDTO {
    fileName: string;
    fileType: string;
    folder?: StorageFolder;
    fileSize?: number;
    userId: string;
}

export interface PresignedUrlResponseDTO {
    uploadUrl: string;
    fileUrl: string;
    key: string;
    expiresIn: number;
}

export interface DeleteFileInputDTO {
    key?: string;
    fileUrl?: string;
    userId: string;
    userRole: string;
}

export interface StoredFileInfo {
    key: string;
    fileUrl: string;
    folder: StorageFolder;
    userId: string;
}
