import { Request } from "express";

export const extractAccessToken = (req: Request): string | null => {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer "))
        token = req.headers.authorization.split(" ")[1];

    return token || null;
};

export const extractToken = extractAccessToken;
