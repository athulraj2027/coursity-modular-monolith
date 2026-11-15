import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    IIdempotencyService,
    InMemoryIdempotencyService,
    IdempotencyRecord,
} from "../src/infrastructure/idempotency";
import { createIdempotencyMiddleware } from "../src/app/middlewares/idempotency.middleware";

describe("🔒 Idempotency Clean Architecture & Contract Tests", () => {
    describe("1. Domain Contracts & Invariants", () => {
        it("should generate deterministic SHA-256 fingerprint for identical requests", () => {
            const service: IIdempotencyService = new InMemoryIdempotencyService();

            const fp1 = service.generateRequestFingerprint("POST", "/api/v1/payments", { amount: 500 }, "user-1");
            const fp2 = service.generateRequestFingerprint("POST", "/api/v1/payments", { amount: 500 }, "user-1");
            const fp3 = service.generateRequestFingerprint("POST", "/api/v1/payments", { amount: 600 }, "user-1");

            assert.equal(fp1, fp2);
            assert.notEqual(fp1, fp3);
            assert.equal(typeof fp1, "string");
            assert.equal(fp1.length, 64); // SHA-256 hex length
        });

        it("should acquire lock on fresh key and detect in-flight lock", async () => {
            const service: IIdempotencyService = new InMemoryIdempotencyService();
            const key = "test-idem-key-100";
            const hash = "hash-123";

            // 1st acquisition should succeed
            const firstResult = await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: hash,
            });
            assert.equal(firstResult.acquired, true);

            // 2nd acquisition with same hash should report in-progress (acquired: false, mismatch: false)
            const secondResult = await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: hash,
            });
            assert.equal(secondResult.acquired, false);
            assert.equal(secondResult.mismatch, false);
            assert.equal(secondResult.existingRecord?.status, "PROCESSING");
        });

        it("should detect payload tampering / mismatch on same idempotency key", async () => {
            const service: IIdempotencyService = new InMemoryIdempotencyService();
            const key = "test-idem-key-tamper";

            await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: "original-hash",
            });

            // Attempt with different hash
            const tamperedResult = await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: "tampered-hash",
            });

            assert.equal(tamperedResult.acquired, false);
            assert.equal(tamperedResult.mismatch, true);
        });

        it("should save completed response and allow subsequent retrieval", async () => {
            const service: IIdempotencyService = new InMemoryIdempotencyService();
            const key = "test-idem-key-complete";

            await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: "hash-ok",
            });

            await service.saveCompletedResponse({
                key,
                statusCode: 201,
                responseBody: { success: true, orderId: "ord_123" },
            });

            const record = await service.getRecord(key);
            assert.ok(record);
            assert.equal(record.status, "COMPLETED");
            assert.equal(record.statusCode, 201);
            assert.equal(record.responseBody.orderId, "ord_123");
        });

        it("should release lock when marked as failed", async () => {
            const service: IIdempotencyService = new InMemoryIdempotencyService();
            const key = "test-idem-key-fail";

            await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: "hash-fail",
            });

            await service.markFailed(key);

            const record = await service.getRecord(key);
            assert.ok(record);
            assert.equal(record.status, "FAILED");

            // After failure, a new lock can be acquired
            const retry = await service.acquireLock({
                key,
                method: "POST",
                path: "/api/test",
                requestHash: "hash-fail",
            });
            assert.equal(retry.acquired, true);
        });
    });

    describe("2. Middleware Dependency Inversion", () => {
        it("should accept any IIdempotencyService implementation", () => {
            const customService: IIdempotencyService = new InMemoryIdempotencyService();
            const middleware = createIdempotencyMiddleware(customService, { required: false });
            assert.equal(typeof middleware, "function");
        });
    });
});
