import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/resend-otp", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(() => {
        testCtx = createTestApp();
    });

    it("should successfully resend OTP if cooldown has passed", async () => {
        // Mock stored OTP with timestamp older than 1 minute
        testCtx.otpRepo.signupOtps.set("resend.user@example.com", {
            otp: "111111",
            userData: {
                name: "Resend User",
                email: "resend.user@example.com",
                password: "hashedpassword",
                role: "STUDENT",
            },
            createdAt: Date.now() - 70 * 1000, // 70 seconds ago
        });

        const res = await request(testCtx.app)
            .post("/api/auth/resend-otp")
            .send({
                email: "resend.user@example.com",
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.message, "A new OTP has been sent to your email.");

        const updatedOtp = await testCtx.otpRepo.getSignupOtp("resend.user@example.com");
        assert.ok(updatedOtp);
        assert.notEqual(updatedOtp.otp, "111111");
    });

    it("should return 400 if OTP was requested too recently (cooldown active)", async () => {
        // Mock stored OTP created just now
        await testCtx.otpRepo.saveSignupOtp("cooldown.user@example.com", "222222", {
            name: "Cooldown User",
            email: "cooldown.user@example.com",
            password: "hashedpassword",
            role: "STUDENT",
        });

        const res = await request(testCtx.app)
            .post("/api/auth/resend-otp")
            .send({
                email: "cooldown.user@example.com",
            });

        assert.equal(res.status, 400);
        assert.match(res.body.message, /please wait/i);
    });

    it("should return 400 if no pending registration exists", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/resend-otp")
            .send({
                email: "nobody@example.com",
            });

        assert.equal(res.status, 400);
        assert.match(res.body.message, /no pending registration found/i);
    });
});
