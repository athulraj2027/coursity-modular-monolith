import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/signup", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(() => {
        testCtx = createTestApp();
    });

    it("should successfully request OTP for new user signup", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .send({
                name: "John Doe",
                email: "john.doe@example.com",
                password: "SecurePassword123!",
                role: "STUDENT",
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.message, "Signup successful");
        assert.equal(res.body.data.email, "john.doe@example.com");

        // Verify stored OTP in repository
        const stored = await testCtx.otpRepo.getSignupOtp("john.doe@example.com");
        assert.ok(stored);
        assert.equal(stored.userData.name, "John Doe");
    });

    it("should return 400 when validation fails (invalid email or weak password)", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .send({
                name: "J",
                email: "not-an-email",
                password: "weak",
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Validation error");
        assert.ok(Array.isArray(res.body.errors));
        assert.ok(res.body.errors.length > 0);
    });

    it("should return 409 when user already exists in database", async () => {
        // Pre-create user
        await testCtx.userRepo.create({
            name: "Existing User",
            email: "existing@example.com",
            password: "HashedPassword123!",
            role: "STUDENT",
            authProvider: "LOCAL",
        });

        const res = await request(testCtx.app)
            .post("/api/auth/signup")
            .send({
                name: "Existing User",
                email: "existing@example.com",
                password: "SecurePassword123!",
            });

        assert.equal(res.status, 409);
        assert.match(res.body.message, /already exists/i);
    });
});
