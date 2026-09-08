import { env } from "@/app/config/env";

export interface EmailConfig {
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth?: {
            user: string;
            pass: string;
        };
    };
    from: string;
    isConfigured: boolean;
    enableInProcessWorker: boolean;
}

const isConfigured = Boolean(env.SMTP_USER && env.SMTP_PASS);

export const emailConfig: EmailConfig = {
    smtp: {
        host: env.SMTP_HOST || "smtp.gmail.com",
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_SECURE || false,
        auth: isConfigured
            ? {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            }
            : undefined,
    },
    from: env.EMAIL_FROM || "Coursity <noreply@coursity.com>",
    isConfigured,
    enableInProcessWorker: env.ENABLE_IN_PROCESS_WORKER ?? true,
};
