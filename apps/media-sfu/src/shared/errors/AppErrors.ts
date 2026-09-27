export abstract class AppError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  public readonly statusCode = 400;
  public readonly errorCode = "BAD_REQUEST";
}

export class UnauthorizedError extends AppError {
  public readonly statusCode = 401;
  public readonly errorCode = "UNAUTHORIZED";
}

export class ForbiddenError extends AppError {
  public readonly statusCode = 403;
  public readonly errorCode = "FORBIDDEN";
}

export class NotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = "NOT_FOUND";
}

export class RoomNotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = "ROOM_NOT_FOUND";
}

export class ParticipantNotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = "PARTICIPANT_NOT_FOUND";
}

export class TransportNotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = "TRANSPORT_NOT_FOUND";
}

export class ProducerNotFoundError extends AppError {
  public readonly statusCode = 404;
  public readonly errorCode = "PRODUCER_NOT_FOUND";
}

export class WorkerPoolExhaustedError extends AppError {
  public readonly statusCode = 503;
  public readonly errorCode = "WORKER_POOL_EXHAUSTED";
}

export class MediaNegotiationError extends AppError {
  public readonly statusCode = 400;
  public readonly errorCode = "MEDIA_NEGOTIATION_FAILED";
}
