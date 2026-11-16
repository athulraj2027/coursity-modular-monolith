import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { env } from "@/app/config/env";

export interface StorageConfig {
    bucketName?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    cloudFrontUrl?: string;
    endpoint?: string;
    backendBaseUrl?: string;
    uploadsDir?: string;
    useLocalStorage?: boolean;
}

export const defaultStorageConfig: StorageConfig = {
    bucketName: env.AWS_S3_BUCKET_NAME || "",
    region: env.AWS_REGION || "us-east-1",
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
    cloudFrontUrl: env.AWS_CLOUDFRONT_URL,
    endpoint: env.AWS_S3_ENDPOINT,
    backendBaseUrl: process.env.API_URL || `http://localhost:${env.PORT}`,
    uploadsDir: process.env.UPLOADS_DIR || "uploads",
    useLocalStorage: process.env.USE_LOCAL_STORAGE === "true" || process.env.STORAGE_DRIVER === "local",
};

export function getStorageConfig(override?: Partial<StorageConfig>): StorageConfig {
    return {
        ...defaultStorageConfig,
        ...override,
    };
}

export function isS3Configured(config: StorageConfig = defaultStorageConfig): boolean {
    if (config.useLocalStorage) {
        return false;
    }
    return Boolean(
        config.bucketName &&
        config.accessKeyId &&
        config.secretAccessKey &&
        !config.accessKeyId.includes("dummy") &&
        !config.accessKeyId.includes("placeholder")
    );
}

export function createS3Client(configOverride?: Partial<StorageConfig>): S3Client | null {
    const config = getStorageConfig(configOverride);
    if (!isS3Configured(config)) {
        return null;
    }

    const clientConfig: S3ClientConfig = {
        region: config.region || "us-east-1",
    };

    if (config.accessKeyId && config.secretAccessKey) {
        clientConfig.credentials = {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        };
    }

    // Only set custom endpoint & forcePathStyle for LocalStack, MinIO or local emulators
    if (
        config.endpoint &&
        (config.endpoint.includes("localhost") ||
            config.endpoint.includes("127.0.0.1") ||
            config.endpoint.includes("minio"))
    ) {
        clientConfig.endpoint = config.endpoint;
        clientConfig.forcePathStyle = true;
    }

    return new S3Client(clientConfig);
}

