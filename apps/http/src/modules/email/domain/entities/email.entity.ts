export type EmailTemplateType =
    | "SIGNUP_OTP"
    | "RESET_PASSWORD_OTP"
    | "TEACHER_STATUS"
    | "WELCOME"
    | "CUSTOM";

export interface EmailAttachment {
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
}

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
    attachments?: EmailAttachment[];
}

export interface EmailJobData {
    jobId?: string;
    templateType: EmailTemplateType;
    payload: EmailPayload;
    metadata?: Record<string, any>;
    createdAt: number;
}

export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
    timestamp: string;
}
