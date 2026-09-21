import { IdempotencyService } from "./idempotency.service";
import { IIdempotencyService } from "./contracts/idempotency-service.abstract";

export const idempotencyService: IIdempotencyService = new IdempotencyService();

export * from "./contracts/idempotency-service.abstract";
export * from "./idempotency.types";
export * from "./idempotency.service";

export default idempotencyService;
