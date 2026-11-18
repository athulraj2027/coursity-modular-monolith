export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

