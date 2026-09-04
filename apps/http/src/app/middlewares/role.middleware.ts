import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";

export const requireRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Authentication required. Please sign in.");
            }

            if (!allowedRoles.includes(req.user.role)) {
                throw new ForbiddenError("Access denied. Insufficient permissions.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
