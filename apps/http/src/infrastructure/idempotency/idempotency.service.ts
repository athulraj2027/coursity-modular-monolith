import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import defaultRedis from "@/infrastructure/redis/redis.client";
import {
    IdempotencyRecord,
    LockAcquisitionResult,
} from "./idempotency.types";

export class IdempotencyService {
    private readonly redisPrefix = "idempotency:";

    constructor(
        private readonly prisma: PrismaClient = defaultPrisma,
        private readonly redis: Redis = defaultRedis
    ) { }

    /**
     * Computes a SHA-256 hash representing the exact payload and context of the request.
     */
    generateRequestFingerprint(method: string, path: string, body: any, userId?: string | null): string {
        const normalizedBody = typeof body === "object" && body !== null ? JSON.stringify(body) : (body || "");
        const raw = `${method.toUpperCase()}:${path.toLowerCase()}:${userId || "anonymous"}:${normalizedBody}`;
        return crypto.createHash("sha256").update(raw).digest("hex");
    }

    /**
     * Multi-tier retrieval: checks Redis (L1) first, falls back to Database (L2).
     */
    async getRecord(key: string): Promise<IdempotencyRecord | null> {
        const redisKey = `${this.redisPrefix}${key}`;

        // 1. Try Redis cache (L1 fast-path)
        try {
            if (this.redis.status === "ready" || this.redis.status === "connect") {
                const cached = await this.redis.get(redisKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    return {
                        ...parsed,
                        expiresAt: new Date(parsed.expiresAt),
                        createdAt: parsed.createdAt ? new Date(parsed.createdAt) : undefined,
                    };
                }
            }
        } catch (err) {
            console.warn(`⚠️ [Idempotency] Redis cache read failed for key ${key}:`, err);
        }

        // 2. Fallback to Database (L2 persistent store)
        try {
            const dbRecord = await this.prisma.idempotencyKey.findUnique({
                where: { key },
            });

            if (!dbRecord) return null;

            // Check if record is already expired in DB
            if (new Date(dbRecord.expiresAt).getTime() < Date.now()) {
                await this.prisma.idempotencyKey.delete({ where: { key } }).catch(() => { });
                return null;
            }

            const record: IdempotencyRecord = {
                id: dbRecord.id,
                key: dbRecord.key,
                userId: dbRecord.userId,
                method: dbRecord.method,
                path: dbRecord.path,
                requestHash: dbRecord.requestHash,
                statusCode: dbRecord.statusCode,
                responseBody: dbRecord.responseBody,
                status: dbRecord.status as any,
                expiresAt: dbRecord.expiresAt,
                createdAt: dbRecord.createdAt,
                updatedAt: dbRecord.updatedAt,
            };

            // Backfill Redis cache if completed
            if (record.status === "COMPLETED") {
                const remainingSeconds = Math.max(
                    1,
                    Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000)
                );
                this.cacheInRedis(redisKey, record, remainingSeconds).catch(() => { });
            }

            return record;
        } catch (dbErr) {
            console.error(`❌ [Idempotency] Database lookup failed for key ${key}:`, dbErr);
            return null;
        }
    }

    /**
     * Atomically acquires an idempotency lock across Redis and DB.
     */
    async acquireLock(params: {
        key: string;
        method: string;
        path: string;
        requestHash: string;
        userId?: string | null;
        ttlSeconds?: number;
        lockTimeoutSeconds?: number;
    }): Promise<LockAcquisitionResult> {
        const {
            key,
            method,
            path,
            requestHash,
            userId,
            ttlSeconds = 86400,
            lockTimeoutSeconds = 30,
        } = params;

        const redisKey = `${this.redisPrefix}${key}`;
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        // 1. Check existing record
        const existing = await this.getRecord(key);
        if (existing) {
            // Validate payload fingerprint integrity
            if (existing.requestHash && existing.requestHash !== requestHash) {
                return {
                    acquired: false,
                    existingRecord: existing,
                    mismatch: true,
                };
            }

            if (existing.status === "COMPLETED" || existing.status === "PROCESSING") {
                return {
                    acquired: false,
                    existingRecord: existing,
                    mismatch: false,
                };
            }
        }

        const processingRecord: IdempotencyRecord = {
            key,
            userId: userId || null,
            method,
            path,
            requestHash,
            status: "PROCESSING",
            expiresAt,
        };

        // 2. Atomic lock in Redis (NX flag ensures exclusive lock acquisition)
        let redisLockAcquired = false;
        try {
            if (this.redis.status === "ready" || this.redis.status === "connect") {
                const res = await this.redis.set(
                    redisKey,
                    JSON.stringify(processingRecord),
                    "EX",
                    lockTimeoutSeconds,
                    "NX"
                );
                redisLockAcquired = res === "OK";
                if (!redisLockAcquired) {
                    // Another concurrent worker acquired it
                    const latest = await this.getRecord(key);
                    return {
                        acquired: false,
                        existingRecord: latest || processingRecord,
                        mismatch: false,
                    };
                }
            }
        } catch (redisErr) {
            console.warn("⚠️ [Idempotency] Redis lock acquisition warning:", redisErr);
        }

        // 3. Persist lock state to Database (L2)
        try {
            await this.prisma.idempotencyKey.upsert({
                where: { key },
                create: {
                    key,
                    userId: userId || null,
                    method,
                    path,
                    requestHash,
                    status: "PROCESSING",
                    expiresAt,
                },
                update: {
                    userId: userId || null,
                    method,
                    path,
                    requestHash,
                    status: "PROCESSING",
                    expiresAt,
                    statusCode: null,
                    responseBody: null as any,
                },
            });
        } catch (dbErr: any) {
            // Handle unique constraint collision if DB locked concurrently
            if (dbErr?.code === "P2002") {
                const latest = await this.getRecord(key);
                return {
                    acquired: false,
                    existingRecord: latest,
                    mismatch: false,
                };
            }
            console.error("❌ [Idempotency] Database lock persistence error:", dbErr);
        }

        return { acquired: true };
    }

    /**
     * Stores the final successful response payload & status code to both DB and Redis.
     */
    async saveCompletedResponse(params: {
        key: string;
        statusCode: number;
        responseBody: any;
        ttlSeconds?: number;
    }): Promise<void> {
        const { key, statusCode, responseBody, ttlSeconds = 86400 } = params;
        const redisKey = `${this.redisPrefix}${key}`;
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        const recordUpdate: Partial<IdempotencyRecord> = {
            statusCode,
            responseBody,
            status: "COMPLETED",
            expiresAt,
        };

        // 1. Update Database
        try {
            await this.prisma.idempotencyKey.update({
                where: { key },
                data: {
                    statusCode,
                    responseBody: responseBody !== undefined ? responseBody : null,
                    status: "COMPLETED",
                    expiresAt,
                },
            });
        } catch (dbErr) {
            console.error(`❌ [Idempotency] Failed to commit completed record to database for ${key}:`, dbErr);
        }

        // 2. Cache in Redis for the full TTL duration
        try {
            const current = await this.getRecord(key);
            const fullRecord = {
                ...(current || {}),
                key,
                statusCode,
                responseBody,
                status: "COMPLETED",
                expiresAt,
            };
            await this.cacheInRedis(redisKey, fullRecord, ttlSeconds);
        } catch (redisErr) {
            console.warn(`⚠️ [Idempotency] Redis caching failed for ${key}:`, redisErr);
        }
    }

    /**
     * Marks request as failed or releases lock so the client can safely retry.
     */
    async markFailed(key: string): Promise<void> {
        const redisKey = `${this.redisPrefix}${key}`;

        // 1. Remove lock from Redis
        try {
            await this.redis.del(redisKey);
        } catch (e) { }

        // 2. Mark as FAILED in Database
        try {
            await this.prisma.idempotencyKey.update({
                where: { key },
                data: { status: "FAILED" },
            }).catch(() => { });
        } catch (e) { }
    }

    private async cacheInRedis(redisKey: string, data: any, ttlSeconds: number): Promise<void> {
        if (this.redis.status === "ready" || this.redis.status === "connect") {
            await this.redis.set(redisKey, JSON.stringify(data), "EX", ttlSeconds);
        }
    }
}

export class InMemoryIdempotencyService extends IdempotencyService {
    public records = new Map<string, IdempotencyRecord>();

    constructor() {
        super(null as any, null as any);
    }

    override async getRecord(key: string): Promise<IdempotencyRecord | null> {
        const record = this.records.get(key);
        if (!record) return null;
        if (record.expiresAt.getTime() < Date.now()) {
            this.records.delete(key);
            return null;
        }
        return { ...record };
    }

    override async acquireLock(params: {
        key: string;
        method: string;
        path: string;
        requestHash: string;
        userId?: string | null;
        ttlSeconds?: number;
        lockTimeoutSeconds?: number;
    }): Promise<LockAcquisitionResult> {
        const { key, method, path, requestHash, userId, ttlSeconds = 86400 } = params;
        const existing = await this.getRecord(key);
        if (existing) {
            if (existing.requestHash && existing.requestHash !== requestHash) {
                return { acquired: false, existingRecord: existing, mismatch: true };
            }
            if (existing.status === "COMPLETED" || existing.status === "PROCESSING") {
                return { acquired: false, existingRecord: existing, mismatch: false };
            }
        }

        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        const record: IdempotencyRecord = {
            key,
            userId: userId || null,
            method,
            path,
            requestHash,
            status: "PROCESSING",
            expiresAt,
        };
        this.records.set(key, record);
        return { acquired: true };
    }

    override async saveCompletedResponse(params: {
        key: string;
        statusCode: number;
        responseBody: any;
        ttlSeconds?: number;
    }): Promise<void> {
        const { key, statusCode, responseBody, ttlSeconds = 86400 } = params;
        const existing = this.records.get(key);
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
        this.records.set(key, {
            ...(existing || { key, method: "POST", path: "/" }),
            statusCode,
            responseBody,
            status: "COMPLETED",
            expiresAt,
        });
    }

    override async markFailed(key: string): Promise<void> {
        const existing = this.records.get(key);
        if (existing) {
            this.records.set(key, { ...existing, status: "FAILED" });
        }
    }
}

export const idempotencyService = new IdempotencyService();
export default idempotencyService;

