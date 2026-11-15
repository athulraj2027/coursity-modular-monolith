import { NodemailerTransport } from "./infrastructure/transport/nodemailer.transport";
import { EmailQueue } from "./infrastructure/queue/email.queue";
import { EmailWorker } from "./infrastructure/queue/email.worker";
import { QueueEmailUseCase } from "./application/use-cases/queue-email.usecase";
import { EmailService } from "./application/services/email.service.impl";
import { emailConfig } from "./infrastructure/config/email.config";
import { IEmailService } from "./domain/contracts/email-service.interface";
import { IEmailTransport } from "./domain/contracts/email-transport.interface";
import { IEmailQueue } from "./domain/contracts/email-queue.interface";

const emailTransport: IEmailTransport = new NodemailerTransport();
const emailQueue: IEmailQueue = new EmailQueue();
const emailWorker = new EmailWorker(emailTransport);
const queueEmailUseCase = new QueueEmailUseCase(emailQueue);
export const emailService: IEmailService = new EmailService(queueEmailUseCase);

export const startEmailWorker = (): void => {
    if (emailConfig.enableInProcessWorker)
        emailWorker.start();
    else
        console.log("ℹ️ [Email Worker] In-process worker is disabled via config (ENABLE_IN_PROCESS_WORKER=false)");
};

export const closeEmailWorker = async (): Promise<void> => {
    await emailWorker.close();
    await emailQueue.close();
};

// 1. Domain Exports
export * from "./domain/entities/email.entity";
export * from "./domain/contracts/email-transport.interface";
export * from "./domain/contracts/email-queue.interface";
export * from "./domain/contracts/email-service.interface";
export * from "./domain/errors/email.error";

// 2. Application Exports
export * from "./application/dtos/send-email.dto";
export * from "./application/use-cases/queue-email.usecase";
export * from "./application/services/email.service.impl";

// 3. Infrastructure Exports
export * from "./infrastructure/config/email.config";
export * from "./infrastructure/transport/nodemailer.transport";
export * from "./infrastructure/queue/email.queue";
export * from "./infrastructure/queue/email.worker";

// 4. Presentation Exports (Templates)
export * from "./presentation/templates/base.template";
export * from "./presentation/templates/signup-otp.template";
export * from "./presentation/templates/reset-password-otp.template";
export * from "./presentation/templates/password-changed.template";
export * from "./presentation/templates/teacher-status.template";
export * from "./presentation/templates/welcome.template";
export * from "./presentation/templates/course-moderation.template";
export * from "./presentation/templates/subscription-purchased.template";

export { emailTransport, emailQueue, emailWorker };
export default emailService;
