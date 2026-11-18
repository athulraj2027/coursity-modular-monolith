import { Queue } from "bullmq";
import { EmailJobData } from "../entities/email.entity";

export interface IEmailQueue {
    add(jobData: EmailJobData, priority?: number, delay?: number): Promise<string>;
    close(): Promise<void>;
    get underlyingQueue(): Queue<EmailJobData>;
}

export abstract class EmailQueueContract implements IEmailQueue {
    abstract add(jobData: EmailJobData, priority?: number, delay?: number): Promise<string>;
    abstract close(): Promise<void>;
    abstract get underlyingQueue(): Queue<EmailJobData>;
}

export { EmailQueueContract as IEmailQueueBase };

