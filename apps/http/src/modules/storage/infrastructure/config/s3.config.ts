import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { env } from "@/app/config/env";

export function isS3Configured(): boolean {
    if (process.env.USE_LOCAL_STORAGE === "true" || process.env.STORAGE_DRIVER === "local") {
        return false;
    }
    return Boolean(
        env.AWS_S3_BUCKET_NAME &&
        env.AWS_ACCESS_KEY_ID &&
        env.AWS_SECRET_ACCESS_KEY &&
        !env.AWS_ACCESS_KEY_ID.includes("dummy") &&
        !env.AWS_ACCESS_KEY_ID.includes("placeholder")
    );
}

export function createS3Client(): S3Client | null {
    if (!isS3Configured()) {
        return null;
    }

    const config: S3ClientConfig = {
        region: env.AWS_REGION || "us-east-1",
    };

    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
        config.credentials = {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        };
    }

    // Only set custom endpoint & forcePathStyle for LocalStack, MinIO or local emulators
    if (
        env.AWS_S3_ENDPOINT &&
        (env.AWS_S3_ENDPOINT.includes("localhost") ||
            env.AWS_S3_ENDPOINT.includes("127.0.0.1") ||
            env.AWS_S3_ENDPOINT.includes("minio"))
    ) {
        config.endpoint = env.AWS_S3_ENDPOINT;
        config.forcePathStyle = true;
    }

    return new S3Client(config);
}
