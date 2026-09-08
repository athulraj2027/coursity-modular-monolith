import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { env } from "@/app/config/env";

export function isS3Configured(): boolean {
    return Boolean(
        env.AWS_S3_BUCKET_NAME &&
        ((env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) || env.NODE_ENV === "production")
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

    if (env.AWS_S3_ENDPOINT) {
        config.endpoint = env.AWS_S3_ENDPOINT;
        config.forcePathStyle = true;
    }

    return new S3Client(config);
}
