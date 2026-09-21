import { IdempotencyRecord, LockAcquisitionResult } from "../idempotency.types";

export abstract class IIdempotencyService {
    /**
     * Computes a deterministic request fingerprint hash for payload context.
     */
    abstract generateRequestFingerprint(method: string, path: string, body: any, userId?: string | null): string;

    /**
     * Retrieves existing idempotency record from storage.
     */
    abstract getRecord(key: string): Promise<IdempotencyRecord | null>;

    /**
     * Atomically acquires an idempotency lock for processing.
     */
    abstract acquireLock(params: {
        key: string;
        method: string;
        path: string;
        requestHash: string;
        userId?: string | null;
        ttlSeconds?: number;
        lockTimeoutSeconds?: number;
    }): Promise<LockAcquisitionResult>;

    /**
     * Stores the final successful response payload and status code.
     */
    abstract saveCompletedResponse(params: {
        key: string;
        statusCode: number;
        responseBody: any;
        ttlSeconds?: number;
    }): Promise<void>;

    /**
     * Marks request as failed or releases lock so the client can safely retry.
     */
    abstract markFailed(key: string): Promise<void>;
}
