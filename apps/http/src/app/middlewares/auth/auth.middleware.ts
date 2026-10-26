import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@/app/errors";
import { TokenService } from "@/infrastructure/security";
import { extractAccessToken } from "./token.utils";

export const createAuthMiddleware = (tokenService: TokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = extractAccessToken(req);
            if (!token)
                throw new UnauthorizedError("Authentication required. Please sign in.");
            req.user = tokenService.verifyAccessToken(token);
            next();
        } catch (error: any) {
            next(new UnauthorizedError(error?.message || "Invalid or expired token"));
        }
    };
};
