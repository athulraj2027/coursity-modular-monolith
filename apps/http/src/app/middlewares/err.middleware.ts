import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";
import { AppError } from "../errors/app.error";

export default function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // 1. Log actual server/database error in server console for debugging
    console.error(`\n❌ [Error Handler] ${req.method} ${req.url}:`, err);

    // 2. Check if error is an expected operational AppError (e.g. BadRequest, Unauthorized, Conflict)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            error: err.name || "Application Error",
        });
    }

    // 3. Handle unexpected errors (e.g. Database connection failure, Prisma runtime, syntax errors)
    const statusCode = (err as any).statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const isDevelopment = process.env.NODE_ENV === "development";

    return res.status(statusCode).json({
        message: "Something went wrong on our end. Please try again later.",
        error: isDevelopment ? err.message : "Internal Server Error",
        stack: isDevelopment ? err.stack : undefined,
    });
}
