import rateLimit from "express-rate-limit";
import { Request } from "express";
import { STATUS_CODES } from "../config/status";

interface RateLimiterOptions {
    windowMs?: number;
    max: number;
    message?: string;
}

export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max,
    message = "Too many requests, please try again later.",
}: RateLimiterOptions) => {
    return rateLimit({
        windowMs,
        max: process.env.NODE_ENV === "development" ? Math.max(max, 1000) : max,
        skip: (req: Request) => {
            const path = req.originalUrl || req.baseUrl + req.path || req.url || "";
            // Bypass rate limiting for internal microservice calls, health checks, and internal service secret callers
            if (
                path.startsWith("/internal") ||
                path.startsWith("/health") ||
                path.startsWith("/uploads") ||
                Boolean(req.headers["x-internal-secret"]) ||
                Boolean(req.headers["authorization"]?.includes("coursity_internal"))
            ) {
                return true;
            }
            return false;
        },
        handler: (req, res) => {
            res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({
                message,
            });
        },
    });
};

// Global rate limiter: 100 requests per 15 minutes
export const globalRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes",
});

// Strict Auth rate limiter: 15 requests per 15 minutes
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: "Too many authentication attempts, please try again after 15 minutes",
});
