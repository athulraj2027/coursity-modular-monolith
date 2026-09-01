import { UserRole } from "@/modules/user";

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

export interface OtpRepository {
    saveSignupOtp(email: string, otp: string, userData: TempSignupUser, ttlSeconds?: number): Promise<void>;
    getSignupOtp(email: string): Promise<StoredOtpData | null>;
    deleteSignupOtp(email: string): Promise<void>;

    saveResetPasswordOtp(email: string, otp: string, ttlSeconds?: number): Promise<void>;
    getResetPasswordOtp(email: string): Promise<StoredResetPasswordOtpData | null>;
    deleteResetPasswordOtp(email: string): Promise<void>;
}
