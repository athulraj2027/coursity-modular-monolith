import { EmailPayload } from "../entities/email.entity";

export interface IEmailService {
    /**
     * Send OTP email for user registration verification
     */
    sendSignupOtp(email: string, otp: string, name?: string): Promise<void>;

    /**
     * Send OTP email for password reset
     */
    sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void>;

    /**
     * Send notification email to an instructor when their verification status changes
     */
    sendTeacherStatusUpdate(
        email: string,
        name: string,
        status: "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING",
        feedback?: string | null
    ): Promise<void>;

    /**
     * Send welcome email after account confirmation
     */
    sendWelcomeEmail(email: string, name: string): Promise<void>;

    /**
     * Send generic / custom formatted email
     */
    sendCustomEmail(payload: EmailPayload): Promise<void>;
}
