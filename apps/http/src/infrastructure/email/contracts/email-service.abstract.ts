import { EmailPayload } from "../entities/email.entity";

export abstract class IEmailService {
    abstract sendSignupOtp(email: string, otp: string, name?: string): Promise<void>;
    abstract sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void>;
    abstract sendWelcomeEmail(email: string, name: string): Promise<void>;
    abstract sendPasswordChangedNotification(email: string, name?: string): Promise<void>;
    abstract sendCustomEmail(payload: EmailPayload): Promise<void>;
    abstract sendTeacherStatusUpdate(
        email: string,
        name: string,
        status: "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING",
        feedback?: string | null
    ): Promise<void>
    abstract sendCourseDelistedNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        delistReason: string,
        courseSlug?: string
    ): Promise<void>;
    abstract sendCourseFrozenNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        freezeReason: string,
        courseSlug?: string
    ): Promise<void>;
    abstract sendSubscriptionPurchasedNotification(params: {
        email: string;
        teacherName: string;
        planName: string;
        amount: number;
        currency: string;
        billingCycle: string;
        currentPeriodEnd: Date;
        invoiceNumber: string;
    }): Promise<void>;
}
