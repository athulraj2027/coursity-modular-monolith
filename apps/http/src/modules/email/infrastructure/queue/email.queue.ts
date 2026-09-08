import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "@/app/config/env";
import { EmailJobData } from "../../domain/entities/email.entity";

export const EMAIL_QUEUE_NAME = "email-queue";

/**
 * Creates a dedicated Redis client for BullMQ operations.
 * BullMQ requires maxRetriesPerRequest: null for its blocking command handling.
 */
export const createBullMQRedisConnection = (): Redis => {
    return new Redis(env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy(times) {
            if (times > 10) {
                console.warn("⚠️ [BullMQ Redis] Max reconnect attempts exceeded.");
                return null;
            }
            return Math.min(times * 200, 2000);
        },
    });
};

export class EmailQueue {
    private queue: Queue<EmailJobData> | null = null;
    private connection: Redis | null = null;

    constructor(private readonly customConnection?: Redis) { }

    private getQueue(): Queue<EmailJobData> {
        if (!this.queue) {
            this.connection = this.customConnection || createBullMQRedisConnection();

            this.queue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
                connection: this.connection,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 2000,
                    },
                    removeOnComplete: {
                        age: 3600, // Keep completed jobs in history for 1 hour
                        count: 100, // Keep last 100 completed jobs
                    },
                    removeOnFail: {
                        age: 24 * 3600, // Keep failed jobs for 24 hours for inspection
                        count: 500,
                    },
                },
            });
        }
        return this.queue;
    }

    async add(jobData: EmailJobData, priority?: number, delay?: number): Promise<string> {
        const queue = this.getQueue();
        const job = await queue.add(jobData.templateType, jobData, {
            priority,
            delay,
        });
        return job.id || `job_${Date.now()}`;
    }

    async close(): Promise<void> {
        if (this.queue) {
            await this.queue.close();
            this.queue = null;
        }
        if (this.connection) {
            try {
                if (this.connection.status === "ready" || this.connection.status === "connect") {
                    await this.connection.quit();
                }
            } catch {
                // ignore
            }
            this.connection = null;
        }
    }

    get underlyingQueue(): Queue<EmailJobData> {
        return this.getQueue();
    }
}
