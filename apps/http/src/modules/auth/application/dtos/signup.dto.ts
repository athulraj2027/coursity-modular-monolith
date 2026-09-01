import { UserRole } from "@/modules/user";

export interface SignupUserInputDTO {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface SignupUserOutputDTO {
    id: string;
    name: string;
    email: string;
    role: string;
    authProvider: string;
    isEmailVerified: boolean;
}

// Aliases for convenience
export type SignupUserInput = SignupUserInputDTO;
export type SignupUserOutput = SignupUserOutputDTO;
