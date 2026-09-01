import { UserRole } from "@/modules/user";

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
