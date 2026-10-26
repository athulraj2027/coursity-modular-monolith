import { Response } from "express";
import { STATUS_CODES, StatusCode } from "@/app/config/status";

/**
 * Standard pagination metadata structure for list endpoints.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Standard API response envelope contract.
 */
export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | Record<string, unknown>;
  error?: string;
  errors?: unknown[];
  timestamp: string;
}

/**
 * Helper class for creating consistent, strongly-typed HTTP responses across Express controllers and middlewares.
 */
export class ApiResponse {
  /**
   * Helper to compute standard pagination metadata.
   */
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

  /**
   * Builds a standardized success payload object without sending an HTTP response.
   */
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

  /**
   * Builds a standardized error payload object without sending an HTTP response.
   */
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

  /**
   * Return a 200 OK (or custom 2xx) success response.
   *
   * Usage:
   *   return ApiResponse.success(res, data, "User profile retrieved successfully");
   */
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

  /**
   * Return a 201 Created response.
   *
   * Usage:
   *   return ApiResponse.created(res, newUser, "User registered successfully");
   */
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

  /**
   * Return a 204 No Content response.
   *
   * Usage:
   *   return ApiResponse.noContent(res);
   */
  public static noContent(res: Response): Response {
    return res.status(STATUS_CODES.NO_CONTENT).send();
  }

  /**
   * Return a 200 OK paginated response with calculated pagination metadata.
   *
   * Usage:
   *   return ApiResponse.paginated(res, courses, { total, page, limit });
   */
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

  /**
   * Return a standardized error response.
   *
   * Usage:
   *   return ApiResponse.error(res, "Invalid credentials", 401, "UnauthorizedError");
   */
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
