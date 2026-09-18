import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface VerifyOtpInputDTO {
    email: string;
    otp: string;
}

export interface VerifyOtpOutputDTO {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accessToken?: string;
    refreshToken?: string;
}

export type VerifySignupOtpInput = VerifyOtpInputDTO;
export type VerifySignupOtpOutput = VerifyOtpOutputDTO;
