import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("Google OAuth Routes", () => {
    let testCtx: ReturnType<typeof createTestApp>;

    beforeEach(() => {
        testCtx = createTestApp();
    });

    describe("GET /api/auth/google", () => {
        it("should return the Google OAuth consent URL", async () => {
            const res = await request(testCtx.app)
                .get("/api/auth/google?state=sample_state");

            assert.equal(res.status, 200);
            assert.ok(res.body.data.url);
            assert.match(res.body.data.url, /accounts\.google\.com/);
            assert.match(res.body.data.url, /state=sample_state/);
        });

        it("should redirect when redirect=true is specified", async () => {
            const res = await request(testCtx.app)
                .get("/api/auth/google?redirect=true");

            assert.equal(res.status, 302);
            assert.match(res.header.location, /accounts\.google\.com/);
        });
    });

    describe("POST /api/auth/google", () => {
        it("should authenticate and create user with valid Google ID Token", async () => {
            const res = await request(testCtx.app)
                .post("/api/auth/google")
                .send({
                    idToken: "valid_id_token",
                    role: "STUDENT",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Google authentication successful");
            assert.ok(res.body.data.accessToken);
            assert.ok(res.body.data.refreshToken);
            assert.equal(res.body.data.user.email, "google.user@example.com");

            // Verify user was stored in database with authProvider GOOGLE
            const user = await testCtx.userRepo.findByEmail("google.user@example.com");
            assert.ok(user);
            assert.equal(user.authProvider, "GOOGLE");
        });

        it("should return 400 when no tokens or codes are provided", async () => {
            const res = await request(testCtx.app)
                .post("/api/auth/google")
                .send({});

            assert.equal(res.status, 400);
            assert.equal(res.body.message, "Validation error");
        });
    });

    describe("GET /api/auth/google/callback", () => {
        it("should handle OAuth callback code and authenticate user", async () => {
            const res = await request(testCtx.app)
                .get("/api/auth/google/callback?code=mock_auth_code");

            // If FRONTEND_URL is set, it redirects to frontend with tokens, otherwise returns JSON
            assert.ok([200, 302].includes(res.status));
            if (res.status === 200) {
                assert.ok(res.body.data.accessToken);
                assert.equal(res.body.data.user.email, "oauth.callback@example.com");
            } else {
                assert.match(res.header.location, /accessToken=/);
            }
        });
    });

    describe("POST /api/auth/google/callback", () => {
        it("should handle POST callback with code and return tokens", async () => {
            const res = await request(testCtx.app)
                .post("/api/auth/google/callback")
                .send({
                    code: "mock_auth_code",
                    role: "STUDENT",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Google OAuth callback handled successfully");
            assert.ok(res.body.data.accessToken);
            assert.ok(res.body.data.refreshToken);
            assert.equal(res.body.data.user.email, "oauth.callback@example.com");
        });
    });
});
