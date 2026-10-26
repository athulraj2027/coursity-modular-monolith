import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";
import { AppError } from "../errors/app.error";
import { ApiResponse } from "@/shared/utils/api-response";

export default function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(`\n [Error Handler] ${req.method} ${req.url}:`, err);

    if (err instanceof AppError) {
        return ApiResponse.error(
            res,
            err.message,
            err.statusCode,
            err.name || "Application Error"
        );
    }

    const statusCode = (err as any).statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorDetail = isDevelopment ? err.message : "Internal Server Error";

    return ApiResponse.error(
        res,
        "Something went wrong on our end. Please try again later.",
        statusCode,
        errorDetail
    );
}

