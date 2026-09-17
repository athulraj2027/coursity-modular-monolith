import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IAudioStorageService } from "../../domain/ports/audio-storage.port";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";

export class S3AudioStorageService implements IAudioStorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    this.bucketName = env.STORAGE_BUCKET_NAME;

    if (env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY) {
      this.s3Client = new S3Client({
        region: env.STORAGE_REGION,
        credentials: {
          accessKeyId: env.STORAGE_ACCESS_KEY,
          secretAccessKey: env.STORAGE_SECRET_KEY,
        },
      });
    }
  }

  async uploadAudioRecording(
    sessionId: string,
    wavBuffer: Buffer
  ): Promise<string> {
    const key = `interviews/${sessionId}/recording_${Date.now()}.wav`;

    if (!this.s3Client) {
      logger.warn(
        `[Storage:Cloud] Cloud storage credentials not configured. Generating simulated recording URL for session ${sessionId}`
      );
      return `https://${this.bucketName}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
    }

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: wavBuffer || Buffer.alloc(0),
          ContentType: "audio/wav",
        })
      );

      const url = `https://${this.bucketName}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
      logger.success(`[Storage:Cloud] Audio recording uploaded successfully: ${url}`);
      return url;
    } catch (error: any) {
      logger.error("[Storage:Cloud] Audio upload failed:", error.message);
      return `https://${this.bucketName}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
    }
  }
}
