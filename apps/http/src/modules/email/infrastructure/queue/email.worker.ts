import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { EMAIL_QUEUE_NAME, createBullMQRedisConnection } from "./email.queue";
import { EmailJobData } from "../../domain/entities/email.entity";
import { IEmailTransport } from "../../domain/interfaces/email-transport.interface";

export class EmailWorker {
    private worker: Worker<EmailJobData> | null = null;
    private connection: Redis | null = null;
    private isRunning: boolean = false;

    constructor(
        private readonly transport: IEmailTransport,
        private readonly customConnection?: Redis
    ) { }

    start(): void {
        if (this.isRunning && this.worker) {
            return;
        }

        this.connection = this.customConnection || createBullMQRedisConnection();

        this.worker = new Worker<EmailJobData>(
            EMAIL_QUEUE_NAME,
            async (job: Job<EmailJobData>) => {
                const { payload, templateType } = job.data;
                console.log(`\n📨 [Email Worker] Processing Job #${job.id} (Type: ${templateType}) -> To: ${payload.to}`);

                const result = await this.transport.send(payload);
                return result;
            },
            {
                connection: this.connection,
                concurrency: 5, // Process up to 5 emails concurrently
                limiter: {
                    max: 20, // Max 20 emails
                    duration: 1000, // per 1 second (prevents aggressive SMTP rate limiting)
                },
            }
        );

        this.worker.on("completed", (job: Job<EmailJobData>) => {
            console.log(`✅ [Email Worker] Job #${job.id} completed successfully for ${job.data.payload.to}`);
        });

        this.worker.on("failed", (job: Job<EmailJobData> | undefined, err: Error) => {
            console.error(`❌ [Email Worker] Job #${job?.id || "unknown"} failed for ${job?.data?.payload?.to}: ${err.message}`);
        });

        this.worker.on("error", (err: Error) => {
            console.error(`⚠️ [Email Worker Error]: ${err.message}`);
        });

        this.isRunning = true;
        console.log("🚀 [Email Worker] Background queue processor started (concurrency: 5)");
    }

    async close(): Promise<void> {
        if (this.worker) {
            console.log("🛑 [Email Worker] Shutting down queue processor...");
            await this.worker.close();
            this.worker = null;
            this.isRunning = false;
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
        console.log("✅ [Email Worker] Queue processor stopped");
    }

    get running(): boolean {
        return this.isRunning;
    }
}
