import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";
import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { PrismaUserRepository } from "@/modules/user/infrastructure/repositories/prisma-user.repository";

const defaultUserRepo = new PrismaUserRepository();

/**
 * Middleware factory to check if the authenticated user has been blocked.
 * This middleware should run AFTER authMiddleware (which populates req.user).
 */
export const createIsBlockedMiddleware = (userRepository: UserRepository = defaultUserRepo) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.userId) {
                throw new UnauthorizedError("Authentication required. Please sign in.");
            }

            const user = await userRepository.findById(req.user.userId);
            if (!user) {
                throw new UnauthorizedError("User account no longer exists.");
            }

            if (user.isBlocked) {
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
