import { AuthTokens, TokenPayload } from "../entities/token.entity";

export * from "../entities/token.entity";

export interface ITokenGenerator {
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    generateAuthTokens(payload: TokenPayload): AuthTokens;
}

export interface ITokenVerifier {
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
}

export interface ITokenService extends ITokenGenerator, ITokenVerifier {
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    generateAuthTokens(payload: TokenPayload): AuthTokens;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
}

export abstract class TokenService implements ITokenService {
    abstract generateAccessToken(payload: TokenPayload): string;
    abstract generateRefreshToken(payload: TokenPayload): string;
    abstract generateAuthTokens(payload: TokenPayload): AuthTokens;
    abstract verifyAccessToken(token: string): TokenPayload;
    abstract verifyRefreshToken(token: string): TokenPayload;
}

