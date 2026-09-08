import nodemailer, { Transporter } from "nodemailer";
import { IEmailTransport } from "../../domain/interfaces/email-transport.interface";
import { EmailPayload, EmailSendResult } from "../../domain/entities/email.entity";
import { emailConfig } from "../config/email.config";
import { EmailSendError } from "../../domain/errors/email.error";

export class NodemailerTransport implements IEmailTransport {
    private transporter: Transporter | null = null;

    constructor() {
        if (emailConfig.isConfigured) {
            this.transporter = nodemailer.createTransport({
                host: emailConfig.smtp.host,
                port: emailConfig.smtp.port,
                secure: emailConfig.smtp.secure,
                auth: emailConfig.smtp.auth,
                tls: {
                    rejectUnauthorized: false, // Prevents self-signed cert issues in dev
                },
            });
        }
    }

    async send(payload: EmailPayload): Promise<EmailSendResult> {
        const fromAddress = payload.from || emailConfig.from;

        // Fallback simulation mode if SMTP credentials are not configured (e.g. local dev / testing)
        if (!this.transporter || !emailConfig.isConfigured) {
            console.log("\n==========================================================");
            console.log("📧 [EMAIL DISPATCH - DEV SIMULATION MODE]");
            console.log(`   To:      ${payload.to}`);
            console.log(`   From:    ${fromAddress}`);
            console.log(`   Subject: ${payload.subject}`);
            if (payload.text) {
                console.log(`   Body:\n${payload.text.split("\n").map((l) => "   " + l).join("\n")}`);
            }
            console.log("==========================================================\n");

            return {
                success: true,
                messageId: `simulated_${Date.now()}`,
                timestamp: new Date().toISOString(),
            };
        }

        try {
            const info = await this.transporter.sendMail({
                from: fromAddress,
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
                replyTo: payload.replyTo,
                attachments: payload.attachments,
            });

            console.log(`✉️ Email sent successfully to ${payload.to} [MessageId: ${info.messageId}]`);

            return {
                success: true,
                messageId: info.messageId,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            console.error(`❌ Failed to send email via SMTP to ${payload.to}:`, error?.message || error);
            throw new EmailSendError(`Failed to send email to ${payload.to}: ${error?.message || "Unknown error"}`);
        }
    }

    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) {
            return false;
        }

        try {
            await this.transporter.verify();
            console.log("✅ SMTP Server connection verified");
            return true;
        } catch (error: any) {
            console.warn(`⚠️ SMTP Server connection verification failed: ${error?.message || error}`);
            return false;
        }
    }
}
