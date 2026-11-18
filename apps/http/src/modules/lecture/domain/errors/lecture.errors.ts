import { AppError } from "@/app/errors/app.error";

export class LectureError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = "LECTURE_ERROR"
  ) {
    super(message, statusCode, true);
    this.name = "LectureError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LectureNotFoundError extends LectureError {
  constructor(message: string = "Lecture not found or unavailable.") {
    super(message, 404, "LECTURE_NOT_FOUND");
    this.name = "LectureNotFoundError";
  }
}

export class LectureAccessDeniedError extends LectureError {
  constructor(message: string = "You do not have permission to access or modify this lecture.") {
    super(message, 403, "LECTURE_ACCESS_DENIED");
    this.name = "LectureAccessDeniedError";
  }
}

export class LectureConflictError extends LectureError {
  constructor(message: string = "Schedule conflict detected with another lecture.") {
    super(message, 409, "LECTURE_CONFLICT");
    this.name = "LectureConflictError";
  }
}

export class LectureValidationError extends LectureError {
  constructor(message: string = "Invalid lecture data provided.") {
    super(message, 400, "LECTURE_VALIDATION_ERROR");
    this.name = "LectureValidationError";
  }
}
