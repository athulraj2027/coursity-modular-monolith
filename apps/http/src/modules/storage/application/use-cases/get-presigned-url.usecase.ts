import { randomUUID } from "node:crypto";
import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import {
    PresignedUrlRequestDTO,
    PresignedUrlResponseDTO,
    StorageFolder,
    STORAGE_FOLDERS,
    ALL_ALLOWED_MIME_TYPES,
} from "../../domain/entities/storage.entity";
import { InvalidFileTypeError, FileSizeExceededError } from "../../domain/errors/storage.error";
import { BadRequestError } from "@/app/errors";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export class GetPresignedUrl {
    constructor(private readonly storageService: IStorageService) { }

    async execute(input: PresignedUrlRequestDTO): Promise<PresignedUrlResponseDTO> {
        if (!input.fileName || !input.fileType) {
            throw new BadRequestError("fileName and fileType are required");
        }

        const normalizedFileType = input.fileType.toLowerCase().trim();
        if (!ALL_ALLOWED_MIME_TYPES.includes(normalizedFileType as any)) {
            throw new InvalidFileTypeError(
                `File type '${normalizedFileType}' is not allowed. Supported formats: JPEG, PNG, WebP, GIF, SVG, PDF.`
            );
        }

        const folder: StorageFolder = input.folder && STORAGE_FOLDERS.includes(input.folder)
            ? input.folder
            : "avatars";

        // Validate max file size
        const maxAllowedSize = normalizedFileType === "application/pdf"
            ? MAX_DOCUMENT_SIZE_BYTES
            : MAX_IMAGE_SIZE_BYTES;

        if (input.fileSize && input.fileSize > maxAllowedSize) {
            const maxMB = maxAllowedSize / (1024 * 1024);
            throw new FileSizeExceededError(`File size exceeds maximum allowed limit of ${maxMB}MB`);
        }

        // Sanitize file name
        const sanitizedFileName = input.fileName
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .toLowerCase();

        // Generate scoped key: folder/userId/uuid-filename
        const key = `${folder}/${input.userId}/${randomUUID()}-${sanitizedFileName}`;

        return this.storageService.getPresignedPutUrl({
            key,
            contentType: normalizedFileType,
            fileSize: input.fileSize,
            expiresIn: 300, // 5 minutes
        });
    }
}
