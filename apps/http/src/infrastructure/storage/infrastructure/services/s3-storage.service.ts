import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    IStorageService,
    StorageService,
    PresignedPutUrlInput,
    UploadBufferInput,
} from "../../domain/contracts/storage-service.interface";
import { PresignedUrlResponseDTO } from "../../domain/entities/storage.entity";
import { StorageError } from "../../domain/errors/storage.error";
import { createS3Client, getStorageConfig, StorageConfig } from "../config/s3.config";

export class S3StorageService extends StorageService implements IStorageService {
    private readonly s3Client: S3Client | null;
    private readonly bucketName: string;
    private readonly region: string;
    private readonly cloudFrontUrl?: string;
    private readonly endpoint?: string;
    private readonly backendBaseUrl: string;
    private readonly uploadsDir: string;

    constructor(
        s3ClientOverride?: S3Client | null,
        configOverride?: Partial<StorageConfig>
    ) {
        super();
        const config = getStorageConfig(configOverride);
        this.s3Client = s3ClientOverride !== undefined ? s3ClientOverride : createS3Client(config);
        this.bucketName = config.bucketName || "";
        this.region = config.region || "us-east-1";
        this.cloudFrontUrl = config.cloudFrontUrl
            ? config.cloudFrontUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
            : undefined;
        this.endpoint = config.endpoint;
        this.backendBaseUrl = config.backendBaseUrl || "http://localhost:3000";
        this.uploadsDir = path.isAbsolute(config.uploadsDir || "uploads")
            ? (config.uploadsDir || "uploads")
            : path.join(process.cwd(), config.uploadsDir || "uploads");

        if (!fs.existsSync(this.uploadsDir)) {
            try {
                fs.mkdirSync(this.uploadsDir, { recursive: true });
            } catch {
                // ignore
            }
        }
    }

    getPublicUrl(key: string): string {
        const cleanKey = key.startsWith("/") ? key.substring(1) : key;

        if (this.s3Client && this.bucketName) {
            if (this.cloudFrontUrl) {
                return `https://${this.cloudFrontUrl}/${cleanKey}`;
            }

            if (this.endpoint && this.endpoint.includes("localhost")) {
                return `${this.endpoint}/${this.bucketName}/${cleanKey}`;
            }

            return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${cleanKey}`;
        }

        // Local Storage public URL
        return `${this.backendBaseUrl}/uploads/${cleanKey}`;
    }

    async getPresignedPutUrl(input: PresignedPutUrlInput): Promise<PresignedUrlResponseDTO> {
        const expiresIn = input.expiresIn || 300; // 5 minutes default
        const cleanKey = input.key.startsWith("/") ? input.key.substring(1) : input.key;

        // 1. Production / Configured AWS S3 Mode
        if (this.s3Client && this.bucketName) {
            try {
                const command = new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: cleanKey,
                    ContentType: input.contentType,
                });

                const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
                const fileUrl = this.getPublicUrl(cleanKey);

                return {
                    uploadUrl,
                    fileUrl,
                    key: cleanKey,
                    expiresIn,
                };
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : "Failed to generate storage upload URL";
                console.error("[S3StorageService] Failed to generate presigned PUT URL:", error);
                throw new StorageError(errMsg);
            }
        }

        // 2. Local Storage Mode (when AWS credentials are not configured)
        const fileUrl = this.getPublicUrl(cleanKey);
        const uploadUrl = `${this.backendBaseUrl}/api/upload/local?key=${encodeURIComponent(cleanKey)}`;

        return {
            uploadUrl,
            fileUrl,
            key: cleanKey,
            expiresIn,
        };
    }

    async deleteFile(key: string): Promise<boolean> {
        const cleanKey = key.startsWith("/") ? key.substring(1) : key;

        if (this.s3Client && this.bucketName) {
            try {
                const command = new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: cleanKey,
                });

                await this.s3Client.send(command);
                return true;
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : "Failed to delete file from storage";
                console.error("[S3StorageService] Failed to delete file from S3:", error);
                throw new StorageError(errMsg);
            }
        }

        // Local Storage file deletion
        const localPath = path.join(this.uploadsDir, cleanKey);
        if (fs.existsSync(localPath)) {
            try {
                await fs.promises.unlink(localPath);
            } catch (e) {
                console.warn(`[Storage - Local] Could not delete local file at ${localPath}:`, e);
            }
        }
        return true;
    }

    async uploadBuffer(input: UploadBufferInput): Promise<string> {
        const cleanKey = input.key.startsWith("/") ? input.key.substring(1) : input.key;

        if (this.s3Client && this.bucketName) {
            try {
                const command = new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: cleanKey,
                    Body: input.buffer,
                    ContentType: input.contentType,
                });

                await this.s3Client.send(command);
                return this.getPublicUrl(cleanKey);
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : "Failed to upload file to storage";
                console.error("[S3StorageService] Failed to upload buffer to S3:", error);
                throw new StorageError(errMsg);
            }
        }

        // Local Storage buffer upload
        const localPath = path.join(this.uploadsDir, cleanKey);
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(localPath, input.buffer);
        return this.getPublicUrl(cleanKey);
    }
}

