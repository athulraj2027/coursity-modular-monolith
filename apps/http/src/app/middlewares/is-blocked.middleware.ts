import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { PrismaUserRepository } from "@/modules/user/infrastructure/repositories/prisma-user.repository";
import { TokenRepository } from "@/modules/auth/domain/repositories/token.repository";
import { RedisTokenRepository } from "@/modules/auth/infrastructure/repositories/redis-token.repository";
import { clearAuthCookies } from "@/app/config/cookie";

const defaultUserRepo = new PrismaUserRepository();
const defaultTokenRepo = new RedisTokenRepository();

/**
 * Middleware factory to check if the authenticated user has been blocked.
 * This middleware should run AFTER authMiddleware (which populates req.user).
 * If the user is blocked or deleted, all authentication cookies and active sessions are cleared.
 */
export const createIsBlockedMiddleware = (
    userRepository: UserRepository = defaultUserRepo,
    tokenRepository: TokenRepository = defaultTokenRepo
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.userId) {
                clearAuthCookies(res);
                throw new UnauthorizedError("Authentication required. Please sign in again.");
            }

            const user = await userRepository.findById(req.user.userId);
            if (!user) {
                clearAuthCookies(res);
                throw new UnauthorizedError("User account no longer exists.");
            }

            if (user.isBlocked) {
                // Immediately remove all session tokens and cookies
                clearAuthCookies(res);
                try {
                    await tokenRepository.deleteRefreshToken(user.id);
                } catch (e) {
                    // ignore if Redis is temporarily unreachable
                }
                throw new ForbiddenError("Your account has been blocked. Please contact support.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const isBlockedMiddleware = createIsBlockedMiddleware();
export default isBlockedMiddleware;
