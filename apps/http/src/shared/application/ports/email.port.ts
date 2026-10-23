import { EmailPayload } from "@/infrastructure/email/entities/email.entity";

export interface IAuthEmailNotifier {
  sendSignupOtp(email: string, otp: string, name?: string): Promise<void>;
  sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordChangedNotification(email: string, name?: string): Promise<void>;
}

export interface ITeacherStatusEmailNotifier {
  sendTeacherStatusUpdate(
    email: string,
    name: string,
    status: "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING",
    feedback?: string | null
  ): Promise<void>;
}

export interface ICourseModerationEmailNotifier {
  sendCourseDelistedNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    delistReason: string,
    courseSlug?: string
  ): Promise<void>;
  sendCourseFrozenNotification(
    email: string,
    teacherName: string,
    courseTitle: string,
    freezeReason: string,
    courseSlug?: string
  ): Promise<void>;
}

export interface ISubscriptionEmailNotifier {
  sendSubscriptionPurchasedNotification(params: {
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

export interface ICustomEmailNotifier {
  sendCustomEmail(payload: EmailPayload): Promise<void>;
}

/**
 * Aggregated port contract implementing segregated role interfaces.
 * Preserves backward compatibility while enabling Interface Segregation.
 */
export abstract class IEmailService
  implements
    IAuthEmailNotifier,
    ITeacherStatusEmailNotifier,
    ICourseModerationEmailNotifier,
    ISubscriptionEmailNotifier,
    ICustomEmailNotifier
{
  abstract sendSignupOtp(email: string, otp: string, name?: string): Promise<void>;
  abstract sendPasswordResetOtp(email: string, otp: string, name?: string): Promise<void>;
  abstract sendWelcomeEmail(email: string, name: string): Promise<void>;
  abstract sendPasswordChangedNotification(email: string, name?: string): Promise<void>;
  abstract sendTeacherStatusUpdate(
    email: string,
    name: string,
    status: "VERIFIED" | "IN_PROGRESS" | "REVOKED" | "REDO" | "PENDING",
    feedback?: string | null
  ): Promise<void>;
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
  abstract sendCustomEmail(payload: EmailPayload): Promise<void>;
}
