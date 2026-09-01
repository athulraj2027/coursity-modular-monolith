import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/logout", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let userId: string;
    let refreshToken: string;

    beforeEach(async () => {
        testCtx = createTestApp();
        const user = await testCtx.userRepo.create({
            name: "Logout User",
            email: "logout.user@example.com",
            password: "hashedpassword",
            role: "STUDENT",
            authProvider: "LOCAL",
            isEmailVerified: true,
        });
        userId = user.id;

        const tokens = testCtx.tokenService.generateAuthTokens({
            userId,
            email: user.email,
            role: user.role,
        });
        refreshToken = tokens.refreshToken;
        await testCtx.tokenRepo.saveRefreshToken(userId, refreshToken);
    });

    it("should successfully log out and remove refresh token from storage using token", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/logout")
            .send({
                refreshToken,
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Logged out successfully");

        const stored = await testCtx.tokenRepo.getRefreshToken(userId);
        assert.equal(stored, null);
    });

    it("should successfully log out using userId directly", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/logout")
            .send({
                userId,
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Logged out successfully");

        const stored = await testCtx.tokenRepo.getRefreshToken(userId);
        assert.equal(stored, null);
    });
});
