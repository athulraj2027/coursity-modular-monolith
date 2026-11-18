import jwt, { SignOptions } from "jsonwebtoken";
import {
    AuthTokens,
    ITokenService,
    TokenPayload,
    TokenService,
} from "../../domain/contracts/token-service.interface";
import { getJwtConfig, JwtConfig } from "../config/jwt.config";
import { UnauthorizedError } from "@/app/errors";

export class JwtTokenService extends TokenService implements ITokenService {
    private readonly secret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor(config?: Partial<JwtConfig>) {
        super();
        const resolvedConfig = getJwtConfig(config);
        this.secret = resolvedConfig.secret;
        this.refreshSecret = resolvedConfig.refreshSecret;
        this.accessExpiresIn = resolvedConfig.accessExpiresIn;
        this.refreshExpiresIn = resolvedConfig.refreshExpiresIn;
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
        } catch {
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
        } catch {
            throw new UnauthorizedError("Invalid or expired refresh token");
        }
    }
}

