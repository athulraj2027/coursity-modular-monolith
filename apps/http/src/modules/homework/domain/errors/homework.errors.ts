import { NotFoundError, ForbiddenError, BadRequestError } from "@/app/errors";

export class HomeworkNotFoundError extends NotFoundError {
  constructor(message = "Homework not found") {
    super(message);
    this.name = "HomeworkNotFoundError";
  }
}

export class SubmissionNotFoundError extends NotFoundError {
  constructor(message = "Homework submission not found") {
    super(message);
    this.name = "SubmissionNotFoundError";
  }
}

export class HomeworkAccessDeniedError extends ForbiddenError {
  constructor(message = "You do not have permission to access or modify this homework assignment") {
    super(message);
    this.name = "HomeworkAccessDeniedError";
  }
}

export class HomeworkValidationError extends BadRequestError {
  constructor(message = "Invalid homework or submission data provided") {
    super(message);
    this.name = "HomeworkValidationError";
  }
}

export class PastDeadlineError extends BadRequestError {
  constructor(message = "The deadline for this homework assignment has passed") {
    super(message);
    this.name = "PastDeadlineError";
  }
}
