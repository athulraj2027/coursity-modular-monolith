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

        it("should reject a Teacher attempting to sign in on the Student portal with 403", async () => {
            // Pre-create a teacher user with the same email returned by mock OAuth
            await testCtx.userRepo.create({
                name: "Teacher Bob",
                email: "google.user@example.com",
                password: null,
                role: "TEACHER",
                authProvider: "GOOGLE",
            });

            const res = await request(testCtx.app)
                .post("/api/auth/google")
                .send({
                    idToken: "valid_id_token",
                    role: "STUDENT",
                });

            assert.equal(res.status, 403);
            assert.match(res.body.message, /registered as a teacher/i);
        });

        it("should reject a Student attempting to sign in on the Teacher portal with 403", async () => {
            // Pre-create a student user with the same email returned by mock OAuth
            await testCtx.userRepo.create({
                name: "Student Alice",
                email: "google.user@example.com",
                password: null,
                role: "STUDENT",
                authProvider: "GOOGLE",
            });

            const res = await request(testCtx.app)
                .post("/api/auth/google")
                .send({
                    idToken: "valid_id_token",
                    role: "TEACHER",
                });

            assert.equal(res.status, 403);
            assert.match(res.body.message, /registered as a student/i);
        });

        it("should allow a Teacher to sign in through the Teacher portal with Google", async () => {
            await testCtx.userRepo.create({
                name: "Teacher Bob",
                email: "google.user@example.com",
                password: null,
                role: "TEACHER",
                authProvider: "GOOGLE",
            });

            const res = await request(testCtx.app)
                .post("/api/auth/google")
                .send({
                    idToken: "valid_id_token",
                    role: "TEACHER",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.data.user.role, "TEACHER");
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
                assert.match(res.header.location, /\/auth\/callback/);
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
