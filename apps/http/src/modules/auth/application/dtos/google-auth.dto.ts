import { UserRole } from "@/modules/user";

export interface GoogleLoginInputDTO {
    idToken?: string;
    credential?: string;
    code?: string;
    role?: UserRole;
}

export interface GoogleAuthOutputDTO {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
    accessToken: string;
    refreshToken: string;
}

export interface GoogleAuthUrlOutputDTO {
    url: string;
}

export type GoogleLoginInput = GoogleLoginInputDTO;
export type GoogleAuthOutput = GoogleAuthOutputDTO;
