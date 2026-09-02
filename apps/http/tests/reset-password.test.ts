import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/reset-password", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let userId: string;

    beforeEach(async () => {
        testCtx = createTestApp();
        const hashedPassword = await testCtx.passwordService.hash("OldPassword123!");
        const user = await testCtx.userRepo.create({
            name: "Reset User",
            email: "reset.user@example.com",
            password: hashedPassword,
            role: "STUDENT",
            authProvider: "LOCAL",
        });
        userId = user.id;

        // Save a valid reset OTP in repository
        await testCtx.otpRepo.saveResetPasswordOtp("reset.user@example.com", "654321");
        // Save an active refresh token
        await testCtx.tokenRepo.saveRefreshToken(userId, "active-refresh-token");
    });

    it("should successfully reset password with valid OTP and new password", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/reset-password")
            .send({
                email: "reset.user@example.com",
                otp: "654321",
                newPassword: "BrandNewPassword123!",
            });

        assert.equal(res.status, 200);
        assert.match(res.body.message, /password has been reset successfully/i);

        // Verify password was updated in database
        const updatedUser = await testCtx.userRepo.findByEmail("reset.user@example.com");
        assert.ok(updatedUser && updatedUser.password);
        const isNewPassValid = await testCtx.passwordService.compare("BrandNewPassword123!", updatedUser.password);
        assert.equal(isNewPassValid, true);

        // Verify OTP is deleted
        const otpInRepo = await testCtx.otpRepo.getResetPasswordOtp("reset.user@example.com");
        assert.equal(otpInRepo, null);

        // Verify active sessions were revoked
        const storedToken = await testCtx.tokenRepo.getRefreshToken(userId);
        assert.equal(storedToken, null);
    });

    it("should return 400 when invalid OTP is provided", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/reset-password")
            .send({
                email: "reset.user@example.com",
                otp: "000000",
                newPassword: "BrandNewPassword123!",
            });

        assert.equal(res.status, 400);
        assert.match(res.body.message, /invalid otp/i);
    });

    it("should return 400 when new password is weak", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/reset-password")
            .send({
                email: "reset.user@example.com",
                otp: "654321",
                newPassword: "weak",
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Validation error");
    });
});
