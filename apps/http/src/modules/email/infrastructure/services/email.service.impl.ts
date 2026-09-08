import { IEmailService } from "../../domain/interfaces/email-service.interface";
import { EmailPayload } from "../../domain/entities/email.entity";
import { QueueEmailUseCase } from "../../application/use-cases/queue-email.usecase";
import { renderSignupOtpEmail } from "../templates/signup-otp.template";
import { renderResetPasswordOtpEmail } from "../templates/reset-password-otp.template";
import { renderTeacherStatusEmail, TeacherApprovalStatus } from "../templates/teacher-status.template";
import { renderWelcomeEmail } from "../templates/welcome.template";

export class EmailService implements IEmailService {
    constructor(private readonly queueEmailUseCase: QueueEmailUseCase) { }

    async sendSignupOtp(email: string, otp: string, name?: string): Promise<void> {
        const { html, text, subject } = renderSignupOtpEmail({ name, otp });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "SIGNUP_OTP",
            payload,
            metadata: { email, name, action: "signup_verification" },
            priority: 1, // High priority for OTPs
        });
    }

    async sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void> {
        const { html, text, subject } = renderResetPasswordOtpEmail({ name, otp });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "RESET_PASSWORD_OTP",
            payload,
            metadata: { email, name, action: "password_reset" },
            priority: 1, // High priority for OTPs
        });
    }

    async sendTeacherStatusUpdate(
        email: string,
        name: string,
        status: TeacherApprovalStatus,
        feedback?: string | null
    ): Promise<void> {
        const { html, text, subject } = renderTeacherStatusEmail({ name, status, feedback });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "TEACHER_STATUS",
            payload,
            metadata: { email, name, status, feedback, action: "instructor_status_update" },
            priority: 2,
        });
    }

    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        const { html, text, subject } = renderWelcomeEmail({ name });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "WELCOME",
            payload,
            metadata: { email, name, action: "welcome_onboarding" },
            priority: 3,
        });
    }

    async sendCustomEmail(payload: EmailPayload): Promise<void> {
        await this.queueEmailUseCase.execute({
            templateType: "CUSTOM",
            payload,
            priority: 3,
        });
    }
}
