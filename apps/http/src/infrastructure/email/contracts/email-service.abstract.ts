import { EmailPayload } from "../entities/email.entity";

export abstract class IEmailService {
    /**
     * Send OTP email for user registration verification
     */
    abstract sendSignupOtp(email: string, otp: string, name?: string): Promise<void>;

    /**
     * Send OTP email for password reset
     */
    abstract sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void>;

    /**
     * Send notification email to an instructor when their verification status changes
     */
    abstract sendTeacherStatusUpdate(
        email: string,
        name: string,
        status: "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING",
        feedback?: string | null
    ): Promise<void>;

    /**
     * Send welcome email after account confirmation
     */
    abstract sendWelcomeEmail(email: string, name: string): Promise<void>;

    /**
     * Send notification email when user password has been changed
     */
    abstract sendPasswordChangedNotification(email: string, name?: string): Promise<void>;

    /**
     * Send notification email to an instructor when their course has been delisted by administration
     */
    abstract sendCourseDelistedNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        delistReason: string,
        courseSlug?: string
    ): Promise<void>;

    /**
     * Send notification email to an instructor when their started course has been frozen by administration
     */
    abstract sendCourseFrozenNotification(
        email: string,
        teacherName: string,
        courseTitle: string,
        freezeReason: string,
        courseSlug?: string
    ): Promise<void>;

    /**
     * Send generic / custom formatted email
     */
    abstract sendCustomEmail(payload: EmailPayload): Promise<void>;
}
