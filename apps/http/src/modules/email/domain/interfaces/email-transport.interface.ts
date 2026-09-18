import { EmailPayload, EmailSendResult } from "../entities/email.entity";

export abstract class IEmailTransport {
    abstract send(payload: EmailPayload): Promise<EmailSendResult>;
    abstract verifyConnection(): Promise<boolean>;
}
