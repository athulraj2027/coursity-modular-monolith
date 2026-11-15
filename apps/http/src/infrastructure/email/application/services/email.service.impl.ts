import { IEmailService } from "../../domain/contracts/email-service.interface";
import { EmailPayload } from "../../domain/entities/email.entity";
import { QueueEmailUseCase } from "../use-cases/queue-email.usecase";
import { renderSignupOtpEmail } from "../../presentation/templates/signup-otp.template";
import { renderResetPasswordOtpEmail } from "../../presentation/templates/reset-password-otp.template";
import { renderTeacherStatusEmail, TeacherApprovalStatus } from "../../presentation/templates/teacher-status.template";
import { renderWelcomeEmail } from "../../presentation/templates/welcome.template";
import { renderPasswordChangedEmail } from "../../presentation/templates/password-changed.template";
import {
    renderCourseDelistedEmail,
    renderCourseFrozenEmail,
} from "../../presentation/templates/course-moderation.template";
import { renderSubscriptionPurchasedEmail } from "../../presentation/templates/subscription-purchased.template";

export class EmailService extends IEmailService {
    constructor(private readonly queueEmailUseCase: QueueEmailUseCase) {
        super();
    }

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
            priority: 1,
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
            metadata: { email, name, status },
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
            metadata: { email, name },
            priority: 3,
        });
    }

    async sendPasswordChangedNotification(email: string, name?: string): Promise<void> {
        const { html, text, subject } = renderPasswordChangedEmail({ name });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "PASSWORD_CHANGED",
            payload,
            metadata: { email, action: "security_alert" },
            priority: 1,
        });
    }

    async sendCourseDelistedNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        delistReason: string,
        courseSlug?: string
    ): Promise<void> {
        const { html, text, subject } = renderCourseDelistedEmail({
            teacherName,
            courseTitle,
            delistReason,
            courseSlug,
        });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "CUSTOM",
            payload,
            metadata: { email, teacherName, courseTitle, action: "course_delisted" },
            priority: 2,
        });
    }

    async sendCourseFrozenNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        freezeReason: string,
        courseSlug?: string
    ): Promise<void> {
        const { html, text, subject } = renderCourseFrozenEmail({
            teacherName,
            courseTitle,
            freezeReason,
            courseSlug,
        });

        const payload: EmailPayload = {
            to: email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "CUSTOM",
            payload,
            metadata: { email, teacherName, courseTitle, action: "course_frozen" },
            priority: 2,
        });
    }

    async sendSubscriptionPurchasedNotification(params: {
        email: string;
        teacherName: string;
        planName: string;
        amount: number;
        currency: string;
        billingCycle: string;
        currentPeriodEnd: Date;
        invoiceNumber: string;
    }): Promise<void> {
        const { html, text, subject } = renderSubscriptionPurchasedEmail({
            teacherName: params.teacherName,
            planName: params.planName,
            amount: params.amount,
            currency: params.currency,
            billingCycle: params.billingCycle,
            currentPeriodEnd: params.currentPeriodEnd,
            invoiceNumber: params.invoiceNumber,
        });

        const payload: EmailPayload = {
            to: params.email,
            subject,
            html,
            text,
        };

        await this.queueEmailUseCase.execute({
            templateType: "CUSTOM",
            payload,
            metadata: {
                email: params.email,
                teacherName: params.teacherName,
                planName: params.planName,
                invoiceNumber: params.invoiceNumber,
                action: "subscription_purchased",
            },
            priority: 2,
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

