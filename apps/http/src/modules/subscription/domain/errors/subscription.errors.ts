import { NotFoundError, BadRequestError } from "@/app/errors";

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionError";
  }
}

export class SubscriptionNotFoundError extends NotFoundError {
  constructor(message = "Subscription not found.") {
    super(message);
    this.name = "SubscriptionNotFoundError";
  }
}

export class SubscriptionPlanInactiveError extends BadRequestError {
  constructor(message = "Plan is currently not available for subscription.") {
    super(message);
    this.name = "SubscriptionPlanInactiveError";
  }
}

export class SubscriptionAlreadySubscribedError extends BadRequestError {
  constructor(message = "You are already subscribed to this plan.") {
    super(message);
    this.name = "SubscriptionAlreadySubscribedError";
  }
}

export class SubscriptionDowngradeNotAllowedError extends BadRequestError {
  constructor(message = "Cannot downgrade an active plan to a lower tier.") {
    super(message);
    this.name = "SubscriptionDowngradeNotAllowedError";
  }
}

export class SubscriptionInvoiceNotFoundError extends NotFoundError {
  constructor(message = "Subscription invoice not found.") {
    super(message);
    this.name = "SubscriptionInvoiceNotFoundError";
  }
}

export class SubscriptionPaymentVerificationError extends BadRequestError {
  constructor(message = "Payment verification failed. Invalid cryptographic signature.") {
    super(message);
    this.name = "SubscriptionPaymentVerificationError";
  }
}

export class SubscriptionUsageNotAllowedError extends BadRequestError {
  constructor(message = "Cannot record usage: No active subscription exists.") {
    super(message);
    this.name = "SubscriptionUsageNotAllowedError";
  }
}

export class SubscriptionRefundError extends BadRequestError {
  constructor(message = "Refund cannot be processed.") {
    super(message);
    this.name = "SubscriptionRefundError";
  }
}

export class SubscriptionValidationError extends BadRequestError {
  constructor(message = "Invalid subscription data provided.") {
    super(message);
    this.name = "SubscriptionValidationError";
  }
}
