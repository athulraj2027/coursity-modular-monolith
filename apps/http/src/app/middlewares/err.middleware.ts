import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";

export default function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    })
}
