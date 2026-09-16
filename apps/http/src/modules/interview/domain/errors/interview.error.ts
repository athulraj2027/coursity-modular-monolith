export class InterviewError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = "INTERVIEW_ERROR"
  ) {
    super(message);
    this.name = "InterviewError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InterviewNotFoundError extends InterviewError {
  constructor(message: string = "Interview session not found") {
    super(message, 404, "INTERVIEW_NOT_FOUND");
    this.name = "InterviewNotFoundError";
  }
}

export class TemplateNotFoundError extends InterviewError {
  constructor(message: string = "Interview template not found") {
    super(message, 404, "TEMPLATE_NOT_FOUND");
    this.name = "TemplateNotFoundError";
  }
}

export class InvalidInterviewStateError extends InterviewError {
  constructor(message: string = "Interview session is not in a valid state for this action") {
    super(message, 409, "INVALID_INTERVIEW_STATE");
    this.name = "InvalidInterviewStateError";
  }
}

export class InterviewAccessDeniedError extends InterviewError {
  constructor(message: string = "Access denied to this interview session") {
    super(message, 403, "INTERVIEW_ACCESS_DENIED");
    this.name = "InterviewAccessDeniedError";
  }
}

export class InternalAuthError extends InterviewError {
  constructor(message: string = "Invalid or missing internal service authorization secret") {
    super(message, 401, "INTERNAL_AUTH_ERROR");
    this.name = "InternalAuthError";
  }
}
