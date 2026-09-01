import jwt, { SignOptions } from "jsonwebtoken";
import { AuthTokens, TokenPayload, TokenService } from "../../../domain/services/token.service";
import { env } from "@/app/config/env";
import { UnauthorizedError } from "@/app/errors";

export class JwtTokenService implements TokenService {
    private readonly secret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.secret = env.JWT_SECRET;
        this.refreshSecret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
        this.accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN || "15m";
        this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
    }

    generateAccessToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.accessExpiresIn as unknown as SignOptions["expiresIn"],
        };
        return jwt.sign(payload, this.secret, options);
    }

    generateRefreshToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.refreshExpiresIn as unknown as SignOptions["expiresIn"],
        };
        return jwt.sign(payload, this.refreshSecret, options);
    }

    generateAuthTokens(payload: TokenPayload): AuthTokens {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }

    verifyAccessToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload & TokenPayload;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        } catch (error) {
            throw new UnauthorizedError("Invalid or expired access token");
        }
    }

    verifyRefreshToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.refreshSecret) as jwt.JwtPayload & TokenPayload;
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        } catch (error) {
            throw new UnauthorizedError("Invalid or expired refresh token");
        }
    }
}
