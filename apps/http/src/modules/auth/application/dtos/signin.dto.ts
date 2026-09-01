import { UserRole } from "@/modules/user";

export interface SigninInputDTO {
    email: string;
    password: string;
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
