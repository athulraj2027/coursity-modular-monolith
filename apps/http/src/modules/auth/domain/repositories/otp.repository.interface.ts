import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface TempSignupUser {
    name: string;
    email: string;
    password: string; // pre-hashed
    role: UserRole;
}

export interface StoredOtpData {
    otp: string;
    userData: TempSignupUser;
    createdAt: number; // Unix timestamp in ms
}

export interface StoredResetPasswordOtpData {
    otp: string;
    email: string;
    createdAt: number; // Unix timestamp in ms
}

/**
 * Interface Segregation: signup OTP operations
 */
export interface ISignupOtpRepository {
    saveSignupOtp(email: string, otp: string, userData: TempSignupUser, ttlSeconds?: number): Promise<void>;
    getSignupOtp(email: string): Promise<StoredOtpData | null>;
    deleteSignupOtp(email: string): Promise<void>;
}

/**
 * Interface Segregation: password reset OTP operations
 */
export interface IPasswordResetOtpRepository {
    saveResetPasswordOtp(email: string, otp: string, ttlSeconds?: number): Promise<void>;
    getResetPasswordOtp(email: string): Promise<StoredResetPasswordOtpData | null>;
    deleteResetPasswordOtp(email: string): Promise<void>;
}

/**
 * Unified OTP repository contract extending both segregated interfaces
 */
export interface IOtpRepository extends ISignupOtpRepository, IPasswordResetOtpRepository { }

// Backward-compatibility alias
export type OtpRepository = IOtpRepository;

