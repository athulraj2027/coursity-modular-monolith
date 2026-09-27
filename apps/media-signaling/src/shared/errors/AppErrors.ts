export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_SERVER_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NoAvailableNodesError extends AppError {
  constructor(message = "No healthy Media SFU nodes available in cluster", details?: unknown) {
    super(message, 503, "NO_MEDIA_NODES_AVAILABLE", details);
  }
}

export class RoomAllocationError extends AppError {
  constructor(message = "Failed to allocate media room", details?: unknown) {
    super(message, 500, "ROOM_ALLOCATION_FAILED", details);
  }
}
