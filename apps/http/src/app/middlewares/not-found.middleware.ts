import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";

export default function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
    res.status(STATUS_CODES.NOT_FOUND).json({
        message: "Not Found",
        error: "Route not found",
    })
}