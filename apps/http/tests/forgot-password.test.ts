import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/forgot-password", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(async () => {
        testCtx = createTestApp();
        const hashedPassword = await testCtx.passwordService.hash("Secret123!");
        await testCtx.userRepo.create({
            name: "Forgot User",
            email: "forgot.user@example.com",
            password: hashedPassword,
            role: "STUDENT",
            authProvider: "LOCAL",
            isEmailVerified: true,
        });
    });

    it("should successfully generate and save a password reset OTP for valid user", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/forgot-password")
            .send({
                email: "forgot.user@example.com",
            });

        assert.equal(res.status, 200);
        assert.match(res.body.message, /password reset otp has been sent/i);

        const storedOtp = await testCtx.otpRepo.getResetPasswordOtp("forgot.user@example.com");
        assert.ok(storedOtp);
        assert.match(storedOtp.otp, /^[0-9]{6}$/);
    });

    it("should return generic success message when user does not exist (security best practice)", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/forgot-password")
            .send({
                email: "nonexistent@example.com",
            });

        assert.equal(res.status, 200);
        assert.match(res.body.message, /if an account with this email exists/i);
    });

    it("should return 400 when email format is invalid", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/forgot-password")
            .send({
                email: "invalid-email-string",
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Validation error");
    });
});
