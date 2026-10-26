import { PresignedUrlResponseDTO } from "../entities/storage.entity";

export abstract class IStorageService {
    abstract getPresignedPutUrl(input: {
        key: string;
        contentType: string;
        fileSize?: number;
        expiresIn?: number;
    }): Promise<PresignedUrlResponseDTO>;
    abstract deleteFile(key: string): Promise<boolean>;
    abstract uploadBuffer(input: {
        key: string;
        buffer: Buffer;
        contentType: string;
    }): Promise<string>;
    abstract getPublicUrl(key: string): string;
}
