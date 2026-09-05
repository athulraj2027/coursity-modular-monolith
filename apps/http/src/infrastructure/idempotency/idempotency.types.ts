export type IdempotencyStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface IdempotencyRecord {
    id?: string;
    key: string;
    userId?: string | null;
    method: string;
    path: string;
    requestHash?: string | null;
    statusCode?: number | null;
    responseBody?: any;
    status: IdempotencyStatus;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LockAcquisitionResult {
    acquired: boolean;
    existingRecord?: IdempotencyRecord | null;
    mismatch?: boolean;
}

export interface IdempotencyOptions {
    /**
     * Cache and database expiration time in seconds. Default: 86400 (24 hours).
     */
    ttlSeconds?: number;
    /**
     * Whether the Idempotency-Key header is strictly required on decorated routes. Default: false.
     */
    required?: boolean;
    /**
     * In-flight processing lock timeout in seconds. Default: 30 seconds.
     */
    lockTimeoutSeconds?: number;
}
