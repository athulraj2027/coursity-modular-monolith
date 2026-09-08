import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("Storage Module Routes", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let studentToken: string;
    let teacherToken: string;
    let adminToken: string;
    let blockedToken: string;
    let studentId: string;
    let teacherId: string;
    let adminId: string;
    let blockedId: string;

    beforeEach(async () => {
        testCtx = createTestApp();

        // 1. Student
        const studentPass = await testCtx.passwordService.hash("StudentPass123!");
        const student = await testCtx.userRepo.create({
            name: "Alice Student",
            email: "alice@example.com",
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

        // 2. Teacher
        const teacherPass = await testCtx.passwordService.hash("TeacherPass123!");
        const teacher = await testCtx.userRepo.create({
            name: "Bob Teacher",
            email: "bob@example.com",
            password: teacherPass,
            role: "TEACHER",
            authProvider: "LOCAL",
        });
        teacherId = teacher.id;
        teacherToken = testCtx.tokenService.generateAccessToken({
            userId: teacher.id,
            email: teacher.email,
            role: teacher.role,
        });

        // 3. Admin
        const adminPass = await testCtx.passwordService.hash("AdminPass123!");
        const admin = await testCtx.userRepo.create({
            name: "Admin User",
            email: "admin@example.com",
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

        // 4. Blocked Student
        const blockedPass = await testCtx.passwordService.hash("BlockedPass123!");
        const blockedUser = await testCtx.userRepo.create({
            name: "Blocked User",
            email: "blocked@example.com",
            password: blockedPass,
            role: "STUDENT",
            authProvider: "LOCAL",
        });
        await testCtx.userRepo.updateBlockStatus(blockedUser.id, true);
        blockedId = blockedUser.id;
        blockedToken = testCtx.tokenService.generateAccessToken({
            userId: blockedUser.id,
            email: blockedUser.email,
            role: blockedUser.role,
        });
    });

    describe("POST /api/upload/presigned-url", () => {
        it("should return 401 when no token is provided", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .send({
                    fileName: "avatar.png",
                    fileType: "image/png",
                    fileSize: 1024 * 100,
                    folder: "avatars",
                });

            assert.strictEqual(res.status, 401);
            assert.ok(res.body.message);
        });

        it("should return 403 when user is blocked", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${blockedToken}`)
                .send({
                    fileName: "avatar.png",
                    fileType: "image/png",
                    fileSize: 1024 * 100,
                    folder: "avatars",
                });

            assert.strictEqual(res.status, 403);
            assert.match(res.body.message, /blocked/i);
        });

        it("should reject invalid file types with 400", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    fileName: "malware.exe",
                    fileType: "application/x-msdownload",
                    fileSize: 1024 * 50,
                    folder: "avatars",
                });

            assert.strictEqual(res.status, 400);
            assert.ok(res.body.message);
        });

        it("should reject invalid folder targets with 400", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    fileName: "photo.jpg",
                    fileType: "image/jpeg",
                    fileSize: 1024 * 50,
                    folder: "invalid_folder",
                });

            assert.strictEqual(res.status, 400);
            assert.ok(res.body.message);
        });

        it("should reject file sizes exceeding the folder limit (>10MB for avatars) with 400", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    fileName: "huge_avatar.png",
                    fileType: "image/png",
                    fileSize: 15 * 1024 * 1024, // 15MB > 10MB limit
                    folder: "avatars",
                });

            assert.strictEqual(res.status, 400);
            assert.match(res.body.message, /exceeds maximum allowed/i);
        });

        it("should successfully generate a presigned URL for avatar upload", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    fileName: "my avatar photo.png",
                    fileType: "image/png",
                    fileSize: 2 * 1024 * 1024, // 2MB
                    folder: "avatars",
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.data);
            assert.ok(res.body.data.uploadUrl);
            assert.ok(res.body.data.publicUrl);
            assert.ok(res.body.data.key);
            assert.ok(res.body.data.expiresIn);

            // Verify key format: avatars/{studentId}/{uuid}-my_avatar_photo.png
            assert.ok(res.body.data.key.startsWith(`avatars/${studentId}/`));
            assert.ok(res.body.data.key.endsWith("-my_avatar_photo.png"));
        });

        it("should successfully generate a presigned URL for teacher certificate PDF", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    fileName: "degree_certificate.pdf",
                    fileType: "application/pdf",
                    fileSize: 5 * 1024 * 1024, // 5MB
                    folder: "certificates",
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.data);
            assert.ok(res.body.data.uploadUrl);
            assert.ok(res.body.data.publicUrl);
            assert.ok(res.body.data.key.startsWith(`certificates/${teacherId}/`));
            assert.ok(res.body.data.key.endsWith("-degree_certificate.pdf"));
        });

        it("should successfully generate a presigned URL for course thumbnail", async () => {
            const res = await request(testCtx.app)
                .post("/api/upload/presigned-url")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    fileName: "course_thumb.webp",
                    fileType: "image/webp",
                    fileSize: 1 * 1024 * 1024,
                    folder: "courses",
                });

            assert.strictEqual(res.status, 200);
            assert.ok(res.body.data);
            assert.ok(res.body.data.key.startsWith(`courses/${teacherId}/`));
            assert.ok(res.body.data.key.endsWith("-course_thumb.webp"));
        });
    });

    describe("DELETE /api/upload/file", () => {
        it("should return 401 when unauthenticated", async () => {
            const res = await request(testCtx.app)
                .delete("/api/upload/file")
                .send({
                    key: `avatars/${studentId}/1234-avatar.png`,
                });

            assert.strictEqual(res.status, 401);
            assert.ok(res.body.message);
        });

        it("should reject deleting files of another user with 403 Forbidden", async () => {
            const otherUserFileKey = `avatars/${teacherId}/9999-avatar.png`;

            const res = await request(testCtx.app)
                .delete("/api/upload/file")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    key: otherUserFileKey,
                });

            assert.strictEqual(res.status, 403);
            assert.match(res.body.message, /not authorized to delete/i);
        });

        it("should allow the file owner to delete their own file", async () => {
            const ownFileKey = `avatars/${studentId}/1234-avatar.png`;

            const res = await request(testCtx.app)
                .delete("/api/upload/file")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    key: ownFileKey,
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.data.success, true);
            assert.match(res.body.message, /deleted successfully/i);
        });

        it("should allow an ADMIN to delete any user's file", async () => {
            const anyUserFileKey = `certificates/${teacherId}/5555-doc.pdf`;

            const res = await request(testCtx.app)
                .delete("/api/upload/file")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    key: anyUserFileKey,
                });

            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.data.success, true);
            assert.match(res.body.message, /deleted successfully/i);
        });

        it("should reject path traversal attempts with 403", async () => {
            const maliciousKey = `avatars/${studentId}/../../etc/passwd`;

            const res = await request(testCtx.app)
                .delete("/api/upload/file")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    key: maliciousKey,
                });

            assert.strictEqual(res.status, 403);
        });
    });
});
