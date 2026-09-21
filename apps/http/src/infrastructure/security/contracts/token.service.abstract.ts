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

export abstract class TokenService {
    abstract generateAccessToken(payload: TokenPayload): string;
    abstract generateRefreshToken(payload: TokenPayload): string;
    abstract generateAuthTokens(payload: TokenPayload): AuthTokens;
    abstract verifyAccessToken(token: string): TokenPayload;
    abstract verifyRefreshToken(token: string): TokenPayload;
}
