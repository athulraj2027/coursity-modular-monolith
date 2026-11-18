import { IdempotencyService, InMemoryIdempotencyService } from "./infrastructure/services/idempotency.service";
import { IIdempotencyService } from "./domain/contracts/idempotency-service.interface";

export const idempotencyService: IIdempotencyService = new IdempotencyService();

// Domain Exports
export * from "./domain/entities/idempotency.entity";
export * from "./domain/contracts/idempotency-service.interface";

// Infrastructure Exports
export * from "./infrastructure/services/idempotency.service";

export { InMemoryIdempotencyService };
export default idempotencyService;
