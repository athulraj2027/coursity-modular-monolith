import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("User Module Routes", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let studentToken: string;
    let adminToken: string;
    let studentId: string;
    let adminId: string;

    beforeEach(async () => {
        testCtx = createTestApp();

        // 1. Create a student user
        const studentPass = await testCtx.passwordService.hash("StudentPass123!");
        const student = await testCtx.userRepo.create({
            name: "John Student",
            email: "john.student@example.com",
            password: studentPass,
            role: "STUDENT",
            authProvider: "LOCAL",
        });
        studentId = student.id;
        studentToken = testCtx.tokenService.generateAccessToken({
            userId: student.id,
            email: student.email,
            role: student.role,
        });

        // 2. Create an admin user
        const adminPass = await testCtx.passwordService.hash("AdminPass123!");
        const admin = await testCtx.userRepo.create({
            name: "Master Admin",
            email: "admin@coursity.io",
            password: adminPass,
            role: "ADMIN",
            authProvider: "LOCAL",
        });
        adminId = admin.id;
        adminToken = testCtx.tokenService.generateAccessToken({
            userId: admin.id,
            email: admin.email,
            role: admin.role,
        });
    });

    describe("GET /api/users/profile", () => {
        it("should return profile for authenticated user", async () => {
            const res = await request(testCtx.app)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${studentToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "User profile fetched successfully");
            assert.equal(res.body.data.user.id, studentId);
            assert.equal(res.body.data.user.name, "John Student");
            assert.equal(res.body.data.user.email, "john.student@example.com");
            assert.equal(res.body.data.user.password, undefined);
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(testCtx.app).get("/api/users/profile");
            assert.equal(res.status, 401);
        });
    });

    describe("PATCH /api/users/profile", () => {
        it("should update user profile successfully", async () => {
            const res = await request(testCtx.app)
                .patch("/api/users/profile")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ name: "Johnathan Doe" });

            assert.equal(res.status, 200);
            assert.equal(res.body.data.user.name, "Johnathan Doe");

            // Verify in repository
            const updated = await testCtx.userRepo.findById(studentId);
            assert.equal(updated?.name, "Johnathan Doe");
        });

        it("should return 400 when name is too short", async () => {
            const res = await request(testCtx.app)
                .patch("/api/users/profile")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ name: "J" });

            assert.equal(res.status, 400);
            assert.equal(res.body.message, "Validation error");
        });
    });

    describe("POST /api/users/change-password", () => {
        it("should change password with valid current password", async () => {
            const res = await request(testCtx.app)
                .post("/api/users/change-password")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    currentPassword: "StudentPass123!",
                    newPassword: "BrandNewPassword123!",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Password updated successfully");

            // Verify new password can be compared
            const updated = await testCtx.userRepo.findById(studentId);
            const isMatch = await testCtx.passwordService.compare(
                "BrandNewPassword123!",
                updated?.password || ""
            );
            assert.equal(isMatch, true);
        });

        it("should return 400 when current password is wrong", async () => {
            const res = await request(testCtx.app)
                .post("/api/users/change-password")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    currentPassword: "WrongPassword!",
                    newPassword: "BrandNewPassword123!",
                });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /incorrect current password/i);
        });
    });

    describe("GET /api/users (Admin Directory)", () => {
        it("should return paginated users for admin", async () => {
            const res = await request(testCtx.app)
                .get("/api/users?page=1&limit=10")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Users fetched successfully");
            assert.equal(res.body.data.total, 2);
            assert.equal(res.body.data.users.length, 2);
            assert.equal(res.body.data.users[0].password, undefined);
        });

        it("should support search query parameter", async () => {
            const res = await request(testCtx.app)
                .get("/api/users?search=Student")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.data.users.length, 1);
            assert.equal(res.body.data.users[0].email, "john.student@example.com");
        });

        it("should return 403 Forbidden for non-admin user", async () => {
            const res = await request(testCtx.app)
                .get("/api/users")
                .set("Authorization", `Bearer ${studentToken}`);

            assert.equal(res.status, 403);
            assert.match(res.body.message, /access denied/i);
        });
    });

    describe("GET /api/users/:id", () => {
        it("should return user details by id for admin", async () => {
            const res = await request(testCtx.app)
                .get(`/api/users/${studentId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.data.user.id, studentId);
            assert.equal(res.body.data.user.email, "john.student@example.com");
        });

        it("should return 404 for non-existent user id", async () => {
            const res = await request(testCtx.app)
                .get("/api/users/non-existent-id")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(res.status, 404);
        });
    });

    describe("PATCH /api/users/:id/block", () => {
        it("should allow admin to block a user", async () => {
            const res = await request(testCtx.app)
                .patch(`/api/users/${studentId}/block`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ isBlocked: true });

            assert.equal(res.status, 200);
            assert.equal(res.body.data.user.isBlocked, true);

            const updated = await testCtx.userRepo.findById(studentId);
            assert.equal(updated?.isBlocked, true);
        });

        it("should allow admin to unblock a user", async () => {
            await testCtx.userRepo.updateBlockStatus(studentId, true);

            const res = await request(testCtx.app)
                .patch(`/api/users/${studentId}/block`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ isBlocked: false });

            assert.equal(res.status, 200);
            assert.equal(res.body.data.user.isBlocked, false);
        });

        it("should return 403 when regular student tries to block user", async () => {
            const res = await request(testCtx.app)
                .patch(`/api/users/${adminId}/block`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ isBlocked: true });

            assert.equal(res.status, 403);
        });

        it("should return 400 when attempting to block an admin", async () => {
            const res = await request(testCtx.app)
                .patch(`/api/users/${adminId}/block`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ isBlocked: true });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /administrator/i);
        });
    });
});

