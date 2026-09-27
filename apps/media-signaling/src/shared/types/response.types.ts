import type { Response } from "express";

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiResponse {
  public static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const payload: StandardApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, 201);
  }

  public static error(
    res: Response,
    message: string,
    code = "INTERNAL_SERVER_ERROR",
    statusCode = 500,
    details?: unknown
  ): Response {
    const payload: StandardApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return res.status(statusCode).json(payload);
  }
}
