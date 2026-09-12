import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IStorageService } from "../../domain/interfaces/storage-service.interface";
import { PresignedUrlResponseDTO } from "../../domain/entities/storage.entity";
import { StorageError } from "../../domain/errors/storage.error";
import { createS3Client, isS3Configured } from "../config/s3.config";
import { env } from "@/app/config/env";

export class S3StorageService implements IStorageService {
    private readonly s3Client: S3Client | null;
    private readonly bucketName: string;
    private readonly region: string;
    private readonly cloudFrontUrl?: string;

    constructor(s3ClientOverride?: S3Client | null) {
        this.s3Client = s3ClientOverride !== undefined ? s3ClientOverride : createS3Client();
        this.bucketName = env.AWS_S3_BUCKET_NAME || "";
        this.region = env.AWS_REGION || "us-east-1";
        this.cloudFrontUrl = env.AWS_CLOUDFRONT_URL ? env.AWS_CLOUDFRONT_URL.replace(/^https?:\/\//, "").replace(/\/$/, "") : undefined;
    }

    getPublicUrl(key: string): string {
        const cleanKey = key.startsWith("/") ? key.substring(1) : key;

        if (this.cloudFrontUrl) {
            return `https://${this.cloudFrontUrl}/${cleanKey}`;
        }

        if (env.AWS_S3_ENDPOINT && env.AWS_S3_ENDPOINT.includes("localhost")) {
            return `${env.AWS_S3_ENDPOINT}/${this.bucketName}/${cleanKey}`;
        }

        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${cleanKey}`;
    }

    async getPresignedPutUrl(input: {
        key: string;
        contentType: string;
        fileSize?: number;
        expiresIn?: number;
    }): Promise<PresignedUrlResponseDTO> {
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
            } catch (error: any) {
                console.error("[S3StorageService] Failed to generate presigned PUT URL:", error);
                throw new StorageError(error?.message || "Failed to generate storage upload URL");
            }
        }

        // 2. Dev Simulation Mode (when AWS credentials are not yet configured in development)
        console.log(`\n==========================================================`);
        console.log(`📦 [STORAGE - DEV SIMULATION MODE]`);
        console.log(`   Object Key:   ${cleanKey}`);
        console.log(`   Content Type: ${input.contentType}`);
        console.log(`   Notice:       AWS S3 bucket credentials not configured.`);
        console.log(`                 Simulating upload URL for local dev.`);
        console.log(`==========================================================\n`);

        const simulatedFileUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`;

        return {
            uploadUrl: `https://httpbin.org/put`,
            fileUrl: simulatedFileUrl,
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
            } catch (error: any) {
                console.error("[S3StorageService] Failed to delete file from S3:", error);
                throw new StorageError(error?.message || "Failed to delete file from storage");
            }
        }

        console.log(`[Storage - Dev Simulation] Simulated file deletion for key: ${cleanKey}`);
        return true;
    }

    async uploadBuffer(input: {
        key: string;
        buffer: Buffer;
        contentType: string;
    }): Promise<string> {
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
            } catch (error: any) {
                console.error("[S3StorageService] Failed to upload buffer to S3:", error);
                throw new StorageError(error?.message || "Failed to upload file to storage");
            }
        }

        console.log(`[Storage - Dev Simulation] Simulated buffer upload for key: ${cleanKey}`);
        return this.getPublicUrl(cleanKey);
    }
}
