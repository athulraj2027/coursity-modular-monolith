import { NodemailerTransport } from "./infrastructure/transport/nodemailer.transport";
import { EmailQueue } from "./infrastructure/queue/email.queue";
import { EmailWorker } from "./infrastructure/queue/email.worker";
import { QueueEmailUseCase } from "./application/use-cases/queue-email.usecase";
import { EmailService } from "./infrastructure/services/email.service.impl";
import { emailConfig } from "./infrastructure/config/email.config";

// 1. Instantiate Transport, Queue, and Worker
const emailTransport = new NodemailerTransport();
const emailQueue = new EmailQueue();
const emailWorker = new EmailWorker(emailTransport);

// 2. Instantiate Use Cases
const queueEmailUseCase = new QueueEmailUseCase(emailQueue);

// 3. Instantiate Public Email Service
export const emailService = new EmailService(queueEmailUseCase);

// 4. Worker Lifecycle Control
export const startEmailWorker = (): void => {
    if (emailConfig.enableInProcessWorker) {
        emailWorker.start();
    } else {
        console.log("ℹ️ [Email Worker] In-process worker is disabled via config (ENABLE_IN_PROCESS_WORKER=false)");
    }
};

export const closeEmailWorker = async (): Promise<void> => {
    await emailWorker.close();
    await emailQueue.close();
};

// Public Domain Exports
export * from "./domain/entities/email.entity";
export * from "./domain/interfaces/email-service.interface";
export * from "./domain/interfaces/email-transport.interface";
export * from "./domain/errors/email.error";
export * from "./application/dtos/send-email.dto";

export { emailTransport, emailQueue, emailWorker };
export default emailService;
