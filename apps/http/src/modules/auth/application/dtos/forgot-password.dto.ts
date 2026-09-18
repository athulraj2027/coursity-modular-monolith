import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface ForgotPasswordInputDTO {
    email: string;
    role?: UserRole;
}

export interface ForgotPasswordOutputDTO {
    email: string;
    message: string;
}

export type ForgotPasswordInput = ForgotPasswordInputDTO;
export type ForgotPasswordOutput = ForgotPasswordOutputDTO;
