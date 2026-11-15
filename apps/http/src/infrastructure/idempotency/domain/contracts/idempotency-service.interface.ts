import { IdempotencyRecord, LockAcquisitionResult } from "../entities/idempotency.entity";

export interface IIdempotencyService {
    // Computes a deterministic request fingerprint hash for payload context. 
    generateRequestFingerprint(method: string, path: string, body: any, userId?: string | null): string;
    // Retrieves existing idempotency record from storage.
    getRecord(key: string): Promise<IdempotencyRecord | null>;
    // Atomically acquires an idempotency lock for processing.
    acquireLock(params: {
        key: string;
        method: string;
        path: string;
        requestHash: string;
        userId?: string | null;
        ttlSeconds?: number;
        lockTimeoutSeconds?: number;
    }): Promise<LockAcquisitionResult>;
    //Stores the final successful response payload and status code.
    saveCompletedResponse(params: {
        key: string;
        statusCode: number;
        responseBody: any;
        ttlSeconds?: number;
    }): Promise<void>;

    //Marks request as failed or releases lock so the client can safely retry.
    markFailed(key: string): Promise<void>;
}

export abstract class IdempotencyServiceBase implements IIdempotencyService {
    abstract generateRequestFingerprint(method: string, path: string, body: any, userId?: string | null): string;
    abstract getRecord(key: string): Promise<IdempotencyRecord | null>;
    abstract acquireLock(params: {
        key: string;
        method: string;
        path: string;
        requestHash: string;
        userId?: string | null;
        ttlSeconds?: number;
        lockTimeoutSeconds?: number;
    }): Promise<LockAcquisitionResult>;
    abstract saveCompletedResponse(params: {
        key: string;
        statusCode: number;
        responseBody: any;
        ttlSeconds?: number;
    }): Promise<void>;
    abstract markFailed(key: string): Promise<void>;
}

// Backward compatibility aliases
export { IdempotencyServiceBase as IIdempotencyServiceClass };
export abstract class IIdempotencyServiceAbstract extends IdempotencyServiceBase { }

