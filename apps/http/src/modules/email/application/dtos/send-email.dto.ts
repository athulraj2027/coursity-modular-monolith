import { EmailPayload, EmailTemplateType } from "../../domain/entities/email.entity";

export interface EnqueueEmailInputDTO {
    templateType: EmailTemplateType;
    payload: EmailPayload;
    metadata?: Record<string, any>;
    priority?: number;
    delay?: number;
}

export interface EnqueueEmailOutputDTO {
    jobId: string;
    enqueued: boolean;
    timestamp: string;
}
