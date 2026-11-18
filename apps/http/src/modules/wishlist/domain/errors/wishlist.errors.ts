import { NotFoundError, BadRequestError } from "@/app/errors";

export class WishlistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WishlistError";
  }
}

export class WishlistNotFoundError extends NotFoundError {
  constructor(message = "Wishlist not found") {
    super(message);
    this.name = "WishlistNotFoundError";
  }
}

export class WishlistLimitExceededError extends BadRequestError {
  constructor(message = "Wishlist capacity limit reached (max 100 courses)") {
    super(message);
    this.name = "WishlistLimitExceededError";
  }
}

export class InvalidWishlistOperationError extends BadRequestError {
  constructor(message = "Invalid wishlist operation") {
    super(message);
    this.name = "InvalidWishlistOperationError";
  }
}
