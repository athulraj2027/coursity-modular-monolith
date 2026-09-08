import { EmailPayload, EmailSendResult } from "../entities/email.entity";

export interface IEmailTransport {
    send(payload: EmailPayload): Promise<EmailSendResult>;
    verifyConnection(): Promise<boolean>;
}
