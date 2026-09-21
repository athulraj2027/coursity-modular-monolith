import { PresignedUrlResponseDTO } from "../entities/storage.entity";

export abstract class IStorageService {
    /**
     * Generates a presigned PUT URL allowing the client to upload directly to S3.
     */
    abstract getPresignedPutUrl(input: {
        key: string;
        contentType: string;
        fileSize?: number;
        expiresIn?: number;
    }): Promise<PresignedUrlResponseDTO>;

    /**
     * Deletes a file object from storage by its object key.
     */
    abstract deleteFile(key: string): Promise<boolean>;

    /**
     * Uploads a raw buffer directly to storage (used for server-generated files/exports).
     */
    abstract uploadBuffer(input: {
        key: string;
        buffer: Buffer;
        contentType: string;
    }): Promise<string>;

    /**
     * Returns the permanent public access URL for a given storage key.
     */
    abstract getPublicUrl(key: string): string;
}
