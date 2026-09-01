import { STATUS_CODES } from "../config/status";
import { AppError } from "./app.error";

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request") {
        super(message, STATUS_CODES.BAD_REQUEST);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, STATUS_CODES.UNAUTHORIZED);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, STATUS_CODES.FORBIDDEN);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource Not Found") {
        super(message, STATUS_CODES.NOT_FOUND);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict") {
        super(message, STATUS_CODES.CONFLICT);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message: string = "Unprocessable Entity") {
        super(message, STATUS_CODES.UNPROCESSABLE_ENTITY);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
}
