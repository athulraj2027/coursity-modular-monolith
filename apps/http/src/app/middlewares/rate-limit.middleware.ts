import rateLimit from "express-rate-limit";
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
        max,
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
