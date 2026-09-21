import { NodemailerTransport } from "./transport/nodemailer.transport";
import { EmailQueue } from "./queue/email.queue";
import { EmailWorker } from "./queue/email.worker";
import { QueueEmailUseCase } from "./use-cases/queue-email.usecase";
import { EmailService } from "./services/email.service.impl";
import { emailConfig } from "./config/email.config";
import { IEmailService } from "./contracts/email-service.abstract";
import { IEmailTransport } from "./contracts/email-transport.abstract";
import { IEmailQueue } from "./contracts/email-queue.abstract";

// 1. Instantiate Transport, Queue, and Worker
const emailTransport: IEmailTransport = new NodemailerTransport();
const emailQueue: IEmailQueue = new EmailQueue();
const emailWorker = new EmailWorker(emailTransport);

// 2. Instantiate Use Cases
const queueEmailUseCase = new QueueEmailUseCase(emailQueue);

// 3. Instantiate Shared Singleton Email Service implementing IEmailService abstract class
export const emailService: IEmailService = new EmailService(queueEmailUseCase);

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

// Public Domain / Infrastructure Exports
export * from "./contracts/email-service.abstract";
export * from "./contracts/email-transport.abstract";
export * from "./contracts/email-queue.abstract";
export * from "./entities/email.entity";
export * from "./errors/email.error";
export * from "./dtos/send-email.dto";
export * from "./config/email.config";
export * from "./transport/nodemailer.transport";
export * from "./queue/email.queue";
export * from "./queue/email.worker";
export * from "./services/email.service.impl";
export * from "./use-cases/queue-email.usecase";
export * from "./templates/base.template";
export * from "./templates/signup-otp.template";
export * from "./templates/reset-password-otp.template";
export * from "./templates/password-changed.template";
export * from "./templates/teacher-status.template";
export * from "./templates/welcome.template";
export * from "./templates/course-moderation.template";

export { emailTransport, emailQueue, emailWorker };
export default emailService;
