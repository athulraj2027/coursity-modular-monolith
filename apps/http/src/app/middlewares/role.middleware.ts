import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/app/errors";

export const requireRoles = (...allowedRoles: string[]) => {
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Authentication required. Please sign in.");
            }

            const userRole = (req.user.role || "").toUpperCase();

            if (!normalizedAllowed.includes(userRole)) {
                throw new ForbiddenError("Access denied. Insufficient permissions.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
