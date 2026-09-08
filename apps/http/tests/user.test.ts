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

        it("should return 403 when user is blocked", async () => {
            await testCtx.userRepo.updateBlockStatus(studentId, true);

            const res = await request(testCtx.app)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${studentToken}`);

            assert.equal(res.status, 403);
            assert.match(res.body.message, /blocked/i);
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

    describe("PATCH /api/users/:id/approve", () => {
        let teacherId: string;
        let teacherToken: string;

        beforeEach(async () => {
            const teacher = await testCtx.userRepo.create({
                name: "Sarah Professor",
                email: "sarah@professor.com",
                password: "TeacherPass123!",
                role: "TEACHER",
                authProvider: "LOCAL",
            });
            teacherId = teacher.id;
            teacherToken = testCtx.tokenService.generateAccessToken({
                userId: teacher.id,
                email: teacher.email,
                role: teacher.role,
            });

            // Populate teacher profile with credentials so submission succeeds
            const prof = await testCtx.profileRepo.upsertProfile(teacherId, {
                bio: "PhD in Systems with 10 years experience",
            });
            await testCtx.profileRepo.upsertTeacherProfile(prof.id, {
                expertise: ["Distributed Systems", "Cloud Computing"],
                qualifications: "Ph.D. in Computer Science",
                approvalStatus: "PENDING",
                submissionCount: 0,
            });
        });

        it("should enforce transition flow: PENDING (Teacher submit) -> IN_PROGRESS -> VERIFIED -> REVOKED -> PENDING", async () => {
            // 1. Admin cannot transition directly from PENDING
            const adminDirectRes = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            assert.equal(adminDirectRes.status, 400);
            assert.match(adminDirectRes.body.message, /in draft \(Pending\)/i);

            // 2. Teacher submits for verification: PENDING -> IN_PROGRESS
            const submitRes = await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            assert.equal(submitRes.status, 200);
            assert.equal(submitRes.body.data.profile.teacherProfile.approvalStatus, "IN_PROGRESS");
            assert.equal(submitRes.body.data.profile.teacherProfile.submissionCount, 1);

            // 3. Admin verifies: IN_PROGRESS -> VERIFIED (Allowed)
            const verifyRes = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            assert.equal(verifyRes.status, 200);
            assert.equal(verifyRes.body.data.user.profile?.teacherProfile?.approvalStatus, "VERIFIED");
            assert.equal(verifyRes.body.data.user.profile?.teacherProfile?.isApproved, true);
            assert.equal(verifyRes.body.data.user.profile?.teacherProfile?.submissionCount, 0);

            // 4. Admin revokes: VERIFIED -> REVOKED (Allowed with feedback)
            const revokeRes = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    approvalStatus: "REVOKED",
                    rejectionReason: "Verification revoked due to updated credential requirements.",
                });

            assert.equal(revokeRes.status, 200);
            assert.equal(revokeRes.body.data.user.profile?.teacherProfile?.approvalStatus, "REVOKED");
            assert.equal(revokeRes.body.data.user.profile?.teacherProfile?.isApproved, false);

            // 5. Admin resets: REVOKED -> PENDING (Allowed)
            const resetRes = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "PENDING" });

            assert.equal(resetRes.status, 200);
            assert.equal(resetRes.body.data.user.profile?.teacherProfile?.approvalStatus, "PENDING");
            assert.equal(resetRes.body.data.user.profile?.teacherProfile?.isApproved, false);
        });

        it("should enforce transition flow: PENDING (Teacher submit) -> IN_PROGRESS -> REDO (Teacher re-submit) -> IN_PROGRESS", async () => {
            // Teacher submits: PENDING -> IN_PROGRESS
            await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            // Admin requests redo: IN_PROGRESS -> REDO (with feedback)
            const redoRes = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    approvalStatus: "REDO",
                    rejectionReason: "Please update your experience and certifications.",
                });

            assert.equal(redoRes.status, 200);
            assert.equal(redoRes.body.data.user.profile?.teacherProfile?.approvalStatus, "REDO");

            // Admin cannot transition directly from REDO
            const adminInRedo = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            assert.equal(adminInRedo.status, 400);
            assert.match(adminInRedo.body.message, /marked for revision \(Redo\)/i);

            // Teacher re-submits: REDO -> IN_PROGRESS
            const resubmitRes = await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            assert.equal(resubmitRes.status, 200);
            assert.equal(resubmitRes.body.data.profile.teacherProfile.approvalStatus, "IN_PROGRESS");
            assert.equal(resubmitRes.body.data.profile.teacherProfile.submissionCount, 2);
        });

        it("should enforce 5-attempt limit on verification submissions", async () => {
            // Submit 5 times (alternating PENDING/REDO -> IN_PROGRESS)
            for (let attempt = 1; attempt <= 5; attempt++) {
                const subRes = await request(testCtx.app)
                    .post("/api/profile/teacher/submit-verification")
                    .set("Authorization", `Bearer ${teacherToken}`);

                assert.equal(subRes.status, 200);
                assert.equal(subRes.body.data.profile.teacherProfile.submissionCount, attempt);

                if (attempt < 5) {
                    // Admin sets to REDO for next iteration
                    await request(testCtx.app)
                        .patch(`/api/users/${teacherId}/approve`)
                        .set("Authorization", `Bearer ${adminToken}`)
                        .send({
                            approvalStatus: "REDO",
                            rejectionReason: `Need more changes for attempt ${attempt}`,
                        });
                }
            }

            // Set to REDO so teacher is in an eligible status to try 6th time
            await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    approvalStatus: "REDO",
                    rejectionReason: "Final feedback attempt",
                });

            // 6th attempt should fail due to 5-attempt limit
            const sixthRes = await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            assert.equal(sixthRes.status, 400);
            assert.match(sixthRes.body.message, /maximum verification submission limit \(5 attempts\)/i);
        });

        it("should reject invalid transitions from VERIFIED (only REVOKED allowed)", async () => {
            // Teacher submits -> Admin verifies
            await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);
            await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            // Try VERIFIED -> REDO
            const resRedo = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "REDO", rejectionReason: "Needs changes" });

            assert.equal(resRedo.status, 400);
            assert.match(resRedo.body.message, /invalid status transition from VERIFIED to REDO/i);
        });

        it("should require feedback suggestion when revoking verification or requesting redo", async () => {
            // Teacher submits -> Admin verifies
            await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);
            await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            // Missing rejectionReason on REVOKED
            const resWithoutReason = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "REVOKED" });

            assert.equal(resWithoutReason.status, 400);
            assert.equal(resWithoutReason.body.message, "Validation error");
            assert.match(resWithoutReason.body.errors[0].message, /suggestion or feedback/i);
        });

        it("should allow admin to filter teachers by approvalStatus", async () => {
            // Initially teacher is PENDING
            const resPendingQuery = await request(testCtx.app)
                .get("/api/users?role=TEACHER&approvalStatus=PENDING")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resPendingQuery.status, 200);
            assert.equal(resPendingQuery.body.data.total, 1);
            assert.equal(resPendingQuery.body.data.users[0].id, teacherId);

            // Teacher submits -> Admin marks REDO
            await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    approvalStatus: "REDO",
                    rejectionReason: "Please provide a more detailed bio and portfolio link.",
                });

            const resRedoQuery = await request(testCtx.app)
                .get("/api/users?role=TEACHER&approvalStatus=REDO")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resRedoQuery.status, 200);
            assert.equal(resRedoQuery.body.data.total, 1);
            assert.equal(resRedoQuery.body.data.users[0].id, teacherId);

            const resVerifiedQuery = await request(testCtx.app)
                .get("/api/users?role=TEACHER&approvalStatus=VERIFIED")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resVerifiedQuery.status, 200);
            assert.equal(resVerifiedQuery.body.data.total, 0);
        });

        it("should allow admin to filter teachers by isApproved", async () => {
            // Teacher is currently PENDING (isApproved: false)
            const resUnapproved = await request(testCtx.app)
                .get("/api/users?role=TEACHER&isApproved=false")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resUnapproved.status, 200);
            assert.equal(resUnapproved.body.data.total, 1);
            assert.equal(resUnapproved.body.data.users[0].id, teacherId);

            // Teacher submits -> Admin verifies
            await request(testCtx.app)
                .post("/api/profile/teacher/submit-verification")
                .set("Authorization", `Bearer ${teacherToken}`);

            await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            // Query isApproved=true
            const resApproved = await request(testCtx.app)
                .get("/api/users?role=TEACHER&isApproved=true")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resApproved.status, 200);
            assert.equal(resApproved.body.data.total, 1);
            assert.equal(resApproved.body.data.users[0].id, teacherId);

            // Query isApproved=false should now be 0
            const resUnapprovedAfter = await request(testCtx.app)
                .get("/api/users?role=TEACHER&isApproved=false")
                .set("Authorization", `Bearer ${adminToken}`);

            assert.equal(resUnapprovedAfter.status, 200);
            assert.equal(resUnapprovedAfter.body.data.total, 0);
        });

        it("should return 400 if user is not a teacher", async () => {
            const res = await request(testCtx.app)
                .patch(`/api/users/${studentId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ approvalStatus: "VERIFIED" });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /instructor/i);
        });

        it("should return 403 when non-admin tries to approve a teacher", async () => {
            const res = await request(testCtx.app)
                .patch(`/api/users/${teacherId}/approve`)
                .set("Authorization", `Bearer ${studentToken}`)
                .send({ approvalStatus: "VERIFIED" });

            assert.equal(res.status, 403);
        });
    });
});

