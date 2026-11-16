import { PresignedUrlResponseDTO } from "../entities/storage.entity";

export interface PresignedPutUrlInput {
    key: string;
    contentType: string;
    fileSize?: number;
    expiresIn?: number;
}

export interface UploadBufferInput {
    key: string;
    buffer: Buffer;
    contentType: string;
}

export interface IPresignedUrlService {
    getPresignedPutUrl(input: PresignedPutUrlInput): Promise<PresignedUrlResponseDTO>;
}

export interface IFileDeleterService {
    deleteFile(key: string): Promise<boolean>;
}

export interface IBufferUploaderService {
    uploadBuffer(input: UploadBufferInput): Promise<string>;
}

export interface IPublicUrlService {
    getPublicUrl(key: string): string;
}

export interface IStorageService
    extends IPresignedUrlService,
    IFileDeleterService,
    IBufferUploaderService,
    IPublicUrlService {
    getPresignedPutUrl(input: PresignedPutUrlInput): Promise<PresignedUrlResponseDTO>;
    deleteFile(key: string): Promise<boolean>;
    uploadBuffer(input: UploadBufferInput): Promise<string>;
    getPublicUrl(key: string): string;
}

export abstract class StorageService implements IStorageService {
    abstract getPresignedPutUrl(input: PresignedPutUrlInput): Promise<PresignedUrlResponseDTO>;
    abstract deleteFile(key: string): Promise<boolean>;
    abstract uploadBuffer(input: UploadBufferInput): Promise<string>;
    abstract getPublicUrl(key: string): string;
}

