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

    it("should return 403 when a student tries to sign in on teacher portal", async () => {
        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "signin.user@example.com",
                password: "Secret123!",
                role: "TEACHER",
            });

        assert.equal(res.status, 403);
        assert.match(res.body.message, /registered as a student/i);
    });

    it("should return 403 when a teacher tries to sign in on student portal", async () => {
        const teacherPassword = await testCtx.passwordService.hash("TeacherPass123!");
        await testCtx.userRepo.create({
            name: "Teacher User",
            email: "teacher.user@example.com",
            password: teacherPassword,
            role: "TEACHER",
            authProvider: "LOCAL",
        });

        const res = await request(testCtx.app)
            .post("/api/auth/signin")
            .send({
                email: "teacher.user@example.com",
                password: "TeacherPass123!",
                role: "STUDENT",
            });

        assert.equal(res.status, 403);
        assert.match(res.body.message, /registered as a teacher/i);
    });
});
