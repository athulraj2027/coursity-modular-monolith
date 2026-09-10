import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import { DeleteFileInputDTO, STORAGE_FOLDERS } from "../../domain/entities/storage.entity";
import { StorageUnauthorizedError } from "../../domain/errors/storage.error";
import { BadRequestError } from "@/app/errors";

export class DeleteFile {
    constructor(private readonly storageService: IStorageService) { }

    private extractKey(keyOrUrl: string): string {
        if (!keyOrUrl.startsWith("http://") && !keyOrUrl.startsWith("https://")) {
            return keyOrUrl.startsWith("/") ? keyOrUrl.substring(1) : keyOrUrl;
        }

        try {
            const parsed = new URL(keyOrUrl);
            const pathName = parsed.pathname;
            return pathName.startsWith("/") ? pathName.substring(1) : pathName;
        } catch {
            return keyOrUrl;
        }
    }

    async execute(input: DeleteFileInputDTO): Promise<{ success: boolean; message: string }> {
        const rawIdentifier = input.key || input.fileUrl;
        if (!rawIdentifier) {
            throw new BadRequestError("key or fileUrl is required to delete a storage object");
        }

        const key = this.extractKey(rawIdentifier);

        // Security check: reject path traversal and invalid characters
        if (key.includes("..") || key.includes("\\") || key.startsWith("/")) {
            throw new StorageUnauthorizedError("Invalid file path key");
        }

        const segments = key.split("/");
        if (segments.length < 3) {
            throw new StorageUnauthorizedError("Invalid storage key structure");
        }

        const [folder, fileUserId] = segments;

        // Security check: non-admin users can only delete objects within their own user directory
        const isAdmin = input.userRole === "ADMIN";
        const isOwner = fileUserId === input.userId;

        if (!isAdmin && !isOwner) {
            throw new StorageUnauthorizedError("You are not authorized to delete this file");
        }

        await this.storageService.deleteFile(key);

        return {
            success: true,
            message: "File deleted successfully",
        };
    }
}
