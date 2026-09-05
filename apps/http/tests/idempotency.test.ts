import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("Idempotency Key Middleware & Service", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(() => {
        testCtx = createTestApp();
    });

    it("should process mutating requests normally when no idempotency key is provided", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .send({
                name: "Normal User",
                email: "normal@example.com",
                password: "Password123!",
                role: "STUDENT",
            });

        assert.equal(res.status, 201);
        assert.equal(res.headers["idempotent-replayed"], undefined);
    });

    it("should successfully execute and record response on first request with Idempotency-Key", async () => {
        const idempotencyKey = "test-key-signup-001";

        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send({
                name: "Idempotent User",
                email: "idempotent@example.com",
                password: "Password123!",
                role: "STUDENT",
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.message, "Signup successful");
        assert.equal(res.headers["idempotent-replayed"], undefined);

        // Verify that the record is cached in the idempotency store
        const record = await testCtx.idempotencyService.getRecord(idempotencyKey);
        assert.ok(record);
        assert.equal(record.status, "COMPLETED");
        assert.equal(record.statusCode, 201);
        assert.equal(record.responseBody.message, "Signup successful");
    });

    it("should replay cached response with Idempotent-Replayed header when called with identical payload", async () => {
        const idempotencyKey = "test-key-replay-002";
        const payload = {
            name: "Replay User",
            email: "replay@example.com",
            password: "Password123!",
            role: "STUDENT",
        };

        // 1st request
        const res1 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send(payload);

        assert.equal(res1.status, 201);
        assert.equal(res1.headers["idempotent-replayed"], undefined);

        // 2nd identical request (should hit idempotency cache)
        const res2 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send(payload);

        assert.equal(res2.status, 201);
        assert.equal(res2.headers["idempotent-replayed"], "true");
        assert.deepEqual(res2.body, res1.body);
    });

    it("should accept x-idempotency-key header interchangeably", async () => {
        const idempotencyKey = "test-key-custom-header-003";
        const payload = {
            name: "Header User",
            email: "header@example.com",
            password: "Password123!",
            role: "STUDENT",
        };

        const res1 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("x-idempotency-key", idempotencyKey)
            .send(payload);

        assert.equal(res1.status, 201);

        const res2 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("x-idempotency-key", idempotencyKey)
            .send(payload);

        assert.equal(res2.status, 201);
        assert.equal(res2.headers["idempotent-replayed"], "true");
    });

    it("should return 422 Unprocessable Entity when same idempotency key is reused with a different payload", async () => {
        const idempotencyKey = "test-key-tamper-004";

        // 1st request with payload A
        const res1 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send({
                name: "Original User",
                email: "original@example.com",
                password: "Password123!",
                role: "STUDENT",
            });

        assert.equal(res1.status, 201);

        // 2nd request with same key but altered payload B
        const res2 = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send({
                name: "Tampered User",
                email: "tampered@example.com",
                password: "Password123!",
                role: "STUDENT",
            });

        assert.equal(res2.status, 422);
        assert.match(res2.body.message, /previously used with a different request payload/i);
    });

    it("should return 409 Conflict when a concurrent request with the same key is still PROCESSING", async () => {
        const idempotencyKey = "test-key-conflict-005";

        // Simulate an in-flight processing lock
        const requestHash = testCtx.idempotencyService.generateRequestFingerprint(
            "POST",
            "/api/auth/signup",
            {
                name: "Concurrent User",
                email: "concurrent@example.com",
                password: "Password123!",
                role: "STUDENT",
            }
        );

        await testCtx.idempotencyService.acquireLock({
            key: idempotencyKey,
            method: "POST",
            path: "/api/auth/signup",
            requestHash,
            ttlSeconds: 60,
        });

        // Fire HTTP request while status is still PROCESSING
        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .set("Idempotency-Key", idempotencyKey)
            .send({
                name: "Concurrent User",
                email: "concurrent@example.com",
                password: "Password123!",
                role: "STUDENT",
            });

        assert.equal(res.status, 409);
        assert.match(res.body.message, /currently in progress/i);
        assert.equal(res.headers["retry-after"], "2");
    });

    it("should bypass idempotency logic on GET requests even if header is provided", async () => {
        const idempotencyKey = "test-key-get-006";

        const res = await request(testCtx.app)
            .get("/api/auth/google")
            .set("Idempotency-Key", idempotencyKey);

        assert.equal(res.status, 200);
        assert.equal(res.headers["idempotent-replayed"], undefined);

        // Verify key was never written to idempotency store
        const record = await testCtx.idempotencyService.getRecord(idempotencyKey);
        assert.equal(record, null);
    });
});
