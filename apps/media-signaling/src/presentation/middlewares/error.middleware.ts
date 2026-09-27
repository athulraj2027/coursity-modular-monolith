import { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppErrors";
import { ApiResponse } from "@/shared/types/response.types";
import { logger } from "@/shared/logger/Logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[${err.code}] ${err.message}`, err.details);
    }
    return ApiResponse.error(res, err.message, err.code, err.statusCode, err.details);
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  logger.error("Unhandled Exception:", err);
  return ApiResponse.error(res, message, "INTERNAL_SERVER_ERROR", 500);
};
