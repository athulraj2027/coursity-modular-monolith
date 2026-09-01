import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";

export default function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    const statusCode = (err as any).statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        error: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    })
}
