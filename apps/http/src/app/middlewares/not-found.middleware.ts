import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../config/status";
import { ApiResponse } from "@/shared/utils/api-response";

export default function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
    return ApiResponse.error(
        res,
        "Not Found",
        STATUS_CODES.NOT_FOUND,
        "Route not found"
    );
}