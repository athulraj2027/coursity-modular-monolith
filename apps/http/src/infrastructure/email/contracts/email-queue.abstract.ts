import { Queue } from "bullmq";
import { EmailJobData } from "../entities/email.entity";

export abstract class IEmailQueue {
    abstract add(jobData: EmailJobData, priority?: number, delay?: number): Promise<string>;
    abstract close(): Promise<void>;
    abstract get underlyingQueue(): Queue<EmailJobData>;
}
