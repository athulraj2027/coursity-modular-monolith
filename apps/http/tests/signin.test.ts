import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/signin", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(async () => {
        testCtx = createTestApp();
        const hashedPassword = await testCtx.passwordService.hash("Secret123!");
        await testCtx.userRepo.create({
            name: "Signin User",
            email: "signin.user@example.com",
            password: hashedPassword,
            role: "STUDENT",
            authProvider: "LOCAL",
            isEmailVerified: true,
        });
    });

    it("should sign in successfully with valid credentials and return tokens", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "signin.user@example.com",
                password: "Secret123!",
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Signed in successfully");
        assert.ok(res.body.data.accessToken);
        assert.ok(res.body.data.refreshToken);
        assert.equal(res.body.data.user.email, "signin.user@example.com");

        // Verify refresh token stored in token repository
        const storedToken = await testCtx.tokenRepo.getRefreshToken(res.body.data.user.id);
        assert.equal(storedToken, res.body.data.refreshToken);
    });

    it("should return 401 when password is incorrect", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "signin.user@example.com",
                password: "WrongPassword!",
            });

        assert.equal(res.status, 401);
        assert.match(res.body.message, /invalid email or password/i);
    });

    it("should return 401 when user does not exist", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "nonexistent@example.com",
                password: "Secret123!",
            });

        assert.equal(res.status, 401);
        assert.match(res.body.message, /invalid email or password/i);
    });

    it("should return 403 when email is not verified", async () => {
        const hashedPassword = await testCtx.passwordService.hash("Secret123!");
        await testCtx.userRepo.create({
            name: "Unverified User",
            email: "unverified@example.com",
            password: hashedPassword,
            role: "STUDENT",
            authProvider: "LOCAL",
            isEmailVerified: false,
        });

        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "unverified@example.com",
                password: "Secret123!",
            });

        assert.equal(res.status, 403);
        assert.match(res.body.message, /verify your email/i);
    });
});
