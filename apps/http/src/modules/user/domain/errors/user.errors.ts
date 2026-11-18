import { NotFoundError, BadRequestError } from "@/app/errors";

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class AdminBlockNotAllowedError extends BadRequestError {
  constructor(message = "Cannot block an administrator account") {
    super(message);
    this.name = "AdminBlockNotAllowedError";
  }
}

export class NonTeacherApprovalError extends BadRequestError {
  constructor(message = "Only instructor accounts can have verification status updated") {
    super(message);
    this.name = "NonTeacherApprovalError";
  }
}

export class InvalidApprovalTransitionError extends BadRequestError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidApprovalTransitionError";
  }
}

export class ApprovalFeedbackRequiredError extends BadRequestError {
  constructor(
    message = "Please provide a suggestion or feedback (at least 5 characters) explaining what the instructor should improve"
  ) {
    super(message);
    this.name = "ApprovalFeedbackRequiredError";
  }
}

export class CurrentPasswordRequiredError extends BadRequestError {
  constructor(message = "Current password is required") {
    super(message);
    this.name = "CurrentPasswordRequiredError";
  }
}

export class InvalidCurrentPasswordError extends BadRequestError {
  constructor(message = "Incorrect current password") {
    super(message);
    this.name = "InvalidCurrentPasswordError";
  }
}
