import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/app/errors";
import { TokenService } from "@/modules/auth/domain/services/token.service";
import { JwtTokenService } from "@/modules/auth/infrastructure/services/jwt/jwt-token.service";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

export const createAuthMiddleware = (tokenService: TokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Extract access token from cookies or Bearer Authorization header
            let token = req.cookies?.accessToken;

            if (!token && req.headers.authorization?.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            }

            if (!token) {
                throw new UnauthorizedError("Authentication required. Please sign in.");
            }

            // 2. Verify JWT token
            const payload = tokenService.verifyAccessToken(token);

            // 3. Attach decoded user payload to request
            req.user = payload;
            next();
        } catch (error: any) {
            next(new UnauthorizedError(error?.message || "Invalid or expired token"));
        }
    };
};

const defaultTokenService = new JwtTokenService();
export const authMiddleware = createAuthMiddleware(defaultTokenService);
export default authMiddleware;

