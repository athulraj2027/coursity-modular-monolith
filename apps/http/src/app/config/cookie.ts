import { CookieOptions, Response } from "express";
import { env } from "./env";

const isProduction = env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 minutes (in ms)
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (in ms)
};

export function setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
): void {
    if (tokens.accessToken) {
        res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, accessTokenCookieOptions);
    }
    if (tokens.refreshToken) {
        res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, refreshTokenCookieOptions);
    }
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
        ...accessTokenCookieOptions,
        maxAge: 0,
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        ...refreshTokenCookieOptions,
        maxAge: 0,
    });
}
