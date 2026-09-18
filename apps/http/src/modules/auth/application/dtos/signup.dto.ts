import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface SignupUserInputDTO {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface SignupUserOutputDTO {
    email: string;
    message: string;
}

// Aliases for convenience
export type SignupUserInput = SignupUserInputDTO;
export type SignupUserOutput = SignupUserOutputDTO;
