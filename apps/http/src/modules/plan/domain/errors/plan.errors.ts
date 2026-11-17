import { NotFoundError, BadRequestError, ConflictError } from "@/app/errors";

export class PlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanError";
  }
}

export class PlanNotFoundError extends NotFoundError {
  constructor(message = "Plan not found.") {
    super(message);
    this.name = "PlanNotFoundError";
  }
}

export class PlanConflictError extends ConflictError {
  constructor(message = "Plan conflict detected.") {
    super(message);
    this.name = "PlanConflictError";
  }
}

export class PlanValidationError extends BadRequestError {
  constructor(message = "Invalid plan data provided.") {
    super(message);
    this.name = "PlanValidationError";
  }
}
