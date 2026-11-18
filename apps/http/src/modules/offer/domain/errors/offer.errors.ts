import { NotFoundError, BadRequestError, ConflictError } from "@/app/errors";

export class OfferError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferError";
  }
}

export class OfferNotFoundError extends NotFoundError {
  constructor(message = "Offer not found.") {
    super(message);
    this.name = "OfferNotFoundError";
  }
}

export class OfferValidationError extends BadRequestError {
  constructor(message = "Invalid offer data provided.") {
    super(message);
    this.name = "OfferValidationError";
  }
}

export class OfferNotApplicableError extends BadRequestError {
  constructor(message = "Offer is not applicable.") {
    super(message);
    this.name = "OfferNotApplicableError";
  }
}

export class OfferConflictError extends ConflictError {
  constructor(message = "Offer conflict detected.") {
    super(message);
    this.name = "OfferConflictError";
  }
}
