import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("POST /api/auth/refresh", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let userId: string;
    let validRefreshToken: string;

    beforeEach(async () => {
        testCtx = createTestApp();
        const user = await testCtx.userRepo.create({
            name: "Refresh User",
            email: "refresh.user@example.com",
            password: "hashedpassword",
            role: "STUDENT",
            authProvider: "LOCAL",
        });
        userId = user.id;

        const tokens = testCtx.tokenService.generateAuthTokens({
            userId,
            email: user.email,
            role: user.role,
        });
        validRefreshToken = tokens.refreshToken;
        await testCtx.tokenRepo.saveRefreshToken(userId, validRefreshToken);
    });

    it("should successfully rotate refresh token and issue new access token", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: validRefreshToken,
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Token refreshed successfully");
        assert.ok(res.body.data.accessToken);
        assert.ok(res.body.data.refreshToken);
        assert.equal(res.body.data.user.id, userId);

        // Verify updated token in repository
        const updatedToken = await testCtx.tokenRepo.getRefreshToken(userId);
        assert.equal(updatedToken, res.body.data.refreshToken);
    });

    it("should return 401 when refresh token is expired or revoked from repository", async () => {
        // Delete token from repository to simulate revoked session
        await testCtx.tokenRepo.deleteRefreshToken(userId);

        const res = await request(testCtx.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: validRefreshToken,
            });

        assert.equal(res.status, 401);
        assert.match(res.body.message, /expired or been revoked/i);
    });

    it("should return 401 when refresh token is malformed / invalid signature", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: "invalid.jwt.token",
            });

        assert.equal(res.status, 401);
        assert.match(res.body.message, /invalid or expired refresh token/i);
    });

    it("should return 400 when refresh token is missing", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/refresh")
            .send({});

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Validation error");
    });
});
