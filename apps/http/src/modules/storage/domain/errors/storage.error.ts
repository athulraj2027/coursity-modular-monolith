import { BadRequestError, ForbiddenError, InternalServerError } from "@/app/errors";

export class StorageError extends InternalServerError {
    constructor(message: string = "Storage service operation failed") {
        super(message);
        this.name = "StorageError";
    }
}

export class InvalidFileTypeError extends BadRequestError {
    constructor(message: string = "Unsupported file type") {
        super(message);
        this.name = "InvalidFileTypeError";
    }
}

export class FileSizeExceededError extends BadRequestError {
    constructor(message: string = "File size exceeds allowed limit") {
        super(message);
        this.name = "FileSizeExceededError";
    }
}

export class StorageUnauthorizedError extends ForbiddenError {
    constructor(message: string = "You do not have permission to modify this storage object") {
        super(message);
        this.name = "StorageUnauthorizedError";
    }
}
