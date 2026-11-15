import { EmailPayload, EmailSendResult } from "../entities/email.entity";

export interface IEmailTransport {
    send(payload: EmailPayload): Promise<EmailSendResult>;
    verifyConnection(): Promise<boolean>;
}

export abstract class EmailTransport implements IEmailTransport {
    abstract send(payload: EmailPayload): Promise<EmailSendResult>;
    abstract verifyConnection(): Promise<boolean>;
}

