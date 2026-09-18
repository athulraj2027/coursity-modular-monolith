import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface SigninInputDTO {
    email: string;
    password: string;
    role?: UserRole;
}

export interface SigninOutputDTO {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
    accessToken: string;
    refreshToken: string;
}

export type SigninInput = SigninInputDTO;
export type SigninOutput = SigninOutputDTO;
