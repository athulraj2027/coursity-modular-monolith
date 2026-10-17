import { NextFunction, Request, Response } from "express";
import { TokenService } from "@/infrastructure/security";
import { extractAccessToken } from "./token.utils";

export const createOptionalAuthMiddleware = (tokenService: TokenService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = extractAccessToken(req);
            if (token)
                req.user = tokenService.verifyAccessToken(token);
            next();
        } catch {
            next();
        }
    };
};
