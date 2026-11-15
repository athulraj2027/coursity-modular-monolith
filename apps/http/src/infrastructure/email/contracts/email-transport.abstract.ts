import { EmailPayload, EmailSendResult } from "../entities/email.entity";

export abstract class EmailTransport {
    abstract send(payload: EmailPayload): Promise<EmailSendResult>;
    abstract verifyConnection(): Promise<boolean>;
}
