import { NotFoundError, ForbiddenError, BadRequestError } from "@/app/errors";

export class NoteNotFoundError extends NotFoundError {
  constructor(message = "Note not found") {
    super(message);
    this.name = "NoteNotFoundError";
  }
}

export class NoteAccessDeniedError extends ForbiddenError {
  constructor(message = "You do not have permission to access or modify this note") {
    super(message);
    this.name = "NoteAccessDeniedError";
  }
}

export class NoteValidationError extends BadRequestError {
  constructor(message = "Invalid note data provided") {
    super(message);
    this.name = "NoteValidationError";
  }
}
