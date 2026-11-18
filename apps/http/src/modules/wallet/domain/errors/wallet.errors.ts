import { NotFoundError, BadRequestError } from "@/app/errors";

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}

export class WalletNotFoundError extends NotFoundError {
  constructor(message = "User wallet not found") {
    super(message);
    this.name = "WalletNotFoundError";
  }
}

export class InsufficientWalletBalanceError extends BadRequestError {
  constructor(
    available: number,
    requested: number,
    message?: string
  ) {
    super(
      message ||
        `Insufficient available balance. Available: ₹${available.toFixed(2)}, Requested: ₹${requested.toFixed(2)}`
    );
    this.name = "InsufficientWalletBalanceError";
  }
}

export class InvalidTopUpAmountError extends BadRequestError {
  constructor(message = "Invalid wallet top-up amount") {
    super(message);
    this.name = "InvalidTopUpAmountError";
  }
}

export class InvalidPayoutAmountError extends BadRequestError {
  constructor(message = "Invalid withdrawal amount") {
    super(message);
    this.name = "InvalidPayoutAmountError";
  }
}

export class PayoutRequestNotFoundError extends NotFoundError {
  constructor(message = "Payout request not found") {
    super(message);
    this.name = "PayoutRequestNotFoundError";
  }
}

export class InvalidPayoutStatusTransitionError extends BadRequestError {
  constructor(message = "Invalid payout request status transition") {
    super(message);
    this.name = "InvalidPayoutStatusTransitionError";
  }
}

export class PaymentSignatureVerificationError extends BadRequestError {
  constructor(message = "Invalid payment signature verification failed") {
    super(message);
    this.name = "PaymentSignatureVerificationError";
  }
}

export class MissingBankDetailError extends BadRequestError {
  constructor(
    message = "Please configure a bank account or UPI ID before requesting a payout"
  ) {
    super(message);
    this.name = "MissingBankDetailError";
  }
}

export class WalletAdjustmentReasonRequiredError extends BadRequestError {
  constructor(
    message = "A descriptive reason (min 5 chars) is required for admin wallet adjustments"
  ) {
    super(message);
    this.name = "WalletAdjustmentReasonRequiredError";
  }
}
