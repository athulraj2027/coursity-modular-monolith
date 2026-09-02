import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/verify-otp", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(async () => {
        testCtx = createTestApp();
        // Setup a pending signup OTP
        await testCtx.otpRepo.saveSignupOtp("verify.user@example.com", "123456", {
            name: "Verify User",
            email: "verify.user@example.com",
            password: "hashedpassword123",
            role: "STUDENT",
        });
    });

    it("should successfully verify OTP and create the user account", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/verify-otp")
            .send({
                email: "verify.user@example.com",
                otp: "123456",
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.message, "Account verified and created successfully");
        assert.equal(res.body.data.email, "verify.user@example.com");

        // Verify user exists in database
        const createdUser = await testCtx.userRepo.findByEmail("verify.user@example.com");
        assert.ok(createdUser);

        // Verify OTP is deleted from Redis
        const otpInRepo = await testCtx.otpRepo.getSignupOtp("verify.user@example.com");
        assert.equal(otpInRepo, null);
    });

    it("should return 400 when invalid OTP is provided", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/verify-otp")
            .send({
                email: "verify.user@example.com",
                otp: "999999",
            });

        assert.equal(res.status, 400);
        assert.match(res.body.message, /invalid otp/i);
    });

    it("should return 400 when OTP format is invalid", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/verify-otp")
            .send({
                email: "verify.user@example.com",
                otp: "123",
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Validation error");
    });
});
