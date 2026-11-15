import { Response } from "express";
import { STATUS_CODES, StatusCode } from "@/app/config/status";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | Record<string, unknown>;
  error?: string;
  errors?: unknown[];
  timestamp: string;
}

export class ApiResponse {

  public static computePagination(
    total: number,
    page: number = 1,
    limit: number = 10
  ): PaginationMeta {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    };
  }

  public static buildSuccess<T = unknown>(
    data?: T,
    message: string = "Success",
    meta?: PaginationMeta | Record<string, unknown>,
    extra?: Record<string, unknown>
  ): ApiResponsePayload<T> & Record<string, unknown> {
    const payload: ApiResponsePayload<T> & Record<string, unknown> = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...(extra || {}),
    };

    if (data !== undefined) {
      payload.data = data;
    }

    if (meta !== undefined) {
      payload.meta = meta;
    }

    return payload;
  }

  public static buildError(
    message: string = "An error occurred",
    error?: string,
    errors?: unknown[]
  ): ApiResponsePayload<null> {
    const payload: ApiResponsePayload<null> = {
      success: false,
      message,
      error: error || "ApplicationError",
      timestamp: new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      payload.errors = errors;
    }

    return payload;
  }

  public static success<T = unknown>(
    res: Response,
    data?: T,
    message: string = "Success",
    meta?: PaginationMeta | Record<string, unknown>,
    statusCode: StatusCode | number = STATUS_CODES.OK,
    extra?: Record<string, unknown>
  ): Response {
    return res.status(statusCode).json(this.buildSuccess(data, message, meta, extra));
  }

  public static created<T = unknown>(
    res: Response,
    data?: T,
    message: string = "Resource created successfully",
    meta?: PaginationMeta | Record<string, unknown>
  ): Response {
    return res
      .status(STATUS_CODES.CREATED)
      .json(this.buildSuccess(data, message, meta));
  }

  public static noContent(res: Response): Response {
    return res.status(STATUS_CODES.NO_CONTENT).send();
  }

  public static paginated<T = unknown>(
    res: Response,
    items: T[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    },
    message: string = "Data retrieved successfully"
  ): Response {
    const calculatedTotalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    const totalPages = pagination.totalPages ?? calculatedTotalPages;

    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNextPage:
        pagination.hasNextPage ?? (pagination.page < totalPages),
      hasPrevPage:
        pagination.hasPrevPage ?? (pagination.page > 1),
    };

    return res.status(STATUS_CODES.OK).json(this.buildSuccess(items, message, meta));
  }

  public static error(
    res: Response,
    message: string = "Something went wrong",
    statusCode: StatusCode | number = STATUS_CODES.INTERNAL_SERVER_ERROR,
    error?: string,
    errors?: unknown[]
  ): Response {
    return res
      .status(statusCode)
      .json(this.buildError(message, error, errors));
  }
}

export default ApiResponse;
