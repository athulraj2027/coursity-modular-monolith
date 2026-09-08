import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createTestApp } from "./helpers/test-app";

describe("Profile Module Routes", () => {
    let testCtx: ReturnType<typeof createTestApp>;
    let studentToken: string;
    let teacherToken: string;
    let blockedToken: string;
    let studentId: string;
    let teacherId: string;
    let blockedId: string;

    beforeEach(async () => {
        testCtx = createTestApp();

        // 1. Create student
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

        // 2. Create teacher
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

        // 3. Create blocked student
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

    describe("GET /api/profile", () => {
        it("should return full profile for authenticated student", async () => {
            const res = await request(testCtx.app)
                .get("/api/profile")
                .set("Authorization", `Bearer ${studentToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "User profile fetched successfully");
            assert.equal(res.body.data.profile.id, studentId);
            assert.equal(res.body.data.profile.name, "Alice Student");
            assert.equal(res.body.data.profile.email, "alice@example.com");
            assert.equal(res.body.data.profile.role, "STUDENT");
            assert.equal(res.body.data.profile.password, undefined);
        });

        it("should return full profile for authenticated teacher", async () => {
            const res = await request(testCtx.app)
                .get("/api/profile")
                .set("Authorization", `Bearer ${teacherToken}`);

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "User profile fetched successfully");
            assert.equal(res.body.data.profile.id, teacherId);
            assert.equal(res.body.data.profile.role, "TEACHER");
        });

        it("should return 401 when no token is provided", async () => {
            const res = await request(testCtx.app).get("/api/profile");
            assert.equal(res.status, 401);
        });

        it("should return 403 when user is blocked", async () => {
            const res = await request(testCtx.app)
                .get("/api/profile")
                .set("Authorization", `Bearer ${blockedToken}`);

            assert.equal(res.status, 403);
        });
    });

    describe("PUT & PATCH /api/profile (Generic)", () => {
        it("should update student profile and name using PATCH /api/profile", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    name: "Alice Updated",
                    bio: "Passionate developer",
                    phone: "+1234567890",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Updated");
            assert.equal(res.body.data.profile.profile.bio, "Passionate developer");
            assert.equal(res.body.data.profile.profile.phone, "+1234567890");
        });

        it("should update student profile using PUT /api/profile", async () => {
            const res = await request(testCtx.app)
                .put("/api/profile")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    name: "Alice Put Name",
                    bio: "Passionate lifelong learner",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Put Name");
            assert.equal(res.body.data.profile.profile.bio, "Passionate lifelong learner");
        });

        it("should update teacher profile using PATCH /api/profile", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    name: "Dr. Bob",
                    bio: "Senior systems instructor",
                    expertise: ["Distributed Systems", "Kubernetes", "PostgreSQL"],
                    experienceYears: 12,
                    websiteUrl: "https://drbob.io",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Dr. Bob");
            assert.equal(res.body.data.profile.profile.bio, "Senior systems instructor");
            assert.equal(res.body.data.profile.teacherProfile.experienceYears, 12);
            assert.equal(res.body.data.profile.teacherProfile.websiteUrl, "https://drbob.io");
            assert.deepEqual(res.body.data.profile.teacherProfile.expertise, ["Distributed Systems", "Kubernetes", "PostgreSQL"]);
        });

        it("should return 400 when validation fails (e.g. invalid experienceYears)", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    experienceYears: -5,
                });

            assert.equal(res.status, 400);
        });
    });

    describe("PUT & PATCH /api/profile/student", () => {
        it("should update student profile via PUT /api/profile/student", async () => {
            const res = await request(testCtx.app)
                .put("/api/profile/student")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    name: "Alice Dedicated Student",
                    bio: "Computer Science student",
                    phone: "+1987654321",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Student profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Dedicated Student");
            assert.equal(res.body.data.profile.profile.bio, "Computer Science student");
            assert.equal(res.body.data.profile.profile.phone, "+1987654321");
        });

        it("should update student profile via PATCH /api/profile/student", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile/student")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    phone: "+1234567890",
                    bio: "Studying AI/ML and Cloud Computing",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Student profile updated successfully");
            assert.equal(res.body.data.profile.profile.phone, "+1234567890");
            assert.equal(res.body.data.profile.profile.bio, "Studying AI/ML and Cloud Computing");
        });
    });

    describe("PUT & PATCH /api/profile/teacher", () => {
        it("should update teacher profile via PUT /api/profile/teacher", async () => {
            const res = await request(testCtx.app)
                .put("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    name: "Professor Bob",
                    bio: "20 years of research and teaching",
                    expertise: ["Rust", "Go", "Distributed Algorithms"],
                    qualifications: "Ph.D. in Computer Science",
                    experienceYears: 15,
                    linkedinUrl: "https://linkedin.com/in/profbob",
                    twitterUrl: "https://twitter.com/profbob",
                    websiteUrl: "https://profbob.dev",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Teacher profile updated successfully");
            assert.equal(res.body.data.profile.name, "Professor Bob");
            assert.equal(res.body.data.profile.profile.bio, "20 years of research and teaching");
            assert.equal(res.body.data.profile.teacherProfile.qualifications, "Ph.D. in Computer Science");
            assert.equal(res.body.data.profile.teacherProfile.experienceYears, 15);
            assert.equal(res.body.data.profile.teacherProfile.linkedinUrl, "https://linkedin.com/in/profbob");
        });

        it("should update teacher profile via PATCH /api/profile/teacher when not yet approved", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    linkedinUrl: "https://linkedin.com/in/profbob-new",
                    twitterUrl: "https://twitter.com/profbob_new",
                    bio: "Updated bio before approval",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Teacher profile updated successfully");
            assert.equal(res.body.data.profile.teacherProfile.linkedinUrl, "https://linkedin.com/in/profbob-new");
            assert.equal(res.body.data.profile.teacherProfile.twitterUrl, "https://twitter.com/profbob_new");
        });

        it("should reject modifying linkedinUrl when teacher is approved", async () => {
            // Setup an approved teacher profile
            const profile = await testCtx.profileRepo.upsertProfile(teacherId, {});
            await testCtx.profileRepo.upsertTeacherProfile(profile.id, {
                linkedinUrl: "https://linkedin.com/in/approved-teacher",
                twitterUrl: "https://twitter.com/approved-teacher",
                isApproved: true,
            });

            // Attempt to change linkedinUrl
            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    linkedinUrl: "https://linkedin.com/in/changed-teacher",
                });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /LinkedIn/i);
        });

        it("should reject modifying linkedinUrl and twitterUrl when teacher status is IN_PROGRESS", async () => {
            // Setup an IN_PROGRESS teacher profile
            const profile = await testCtx.profileRepo.upsertProfile(teacherId, {});
            await testCtx.profileRepo.upsertTeacherProfile(profile.id, {
                linkedinUrl: "https://linkedin.com/in/in-progress-teacher",
                twitterUrl: "https://twitter.com/in-progress-teacher",
                approvalStatus: "IN_PROGRESS",
            });

            // Attempt to change linkedinUrl
            const resLinkedin = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    linkedinUrl: "https://linkedin.com/in/changed-in-progress-teacher",
                });

            assert.equal(resLinkedin.status, 400);
            assert.match(resLinkedin.body.message, /In Progress/i);

            // Attempt to change twitterUrl
            const resTwitter = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    twitterUrl: "https://twitter.com/changed-in-progress-teacher",
                });

            assert.equal(resTwitter.status, 400);
            assert.match(resTwitter.body.message, /In Progress/i);
        });

        it("should reject modifying twitterUrl when teacher is approved", async () => {
            // Setup an approved teacher profile
            const profile = await testCtx.profileRepo.upsertProfile(teacherId, {});
            await testCtx.profileRepo.upsertTeacherProfile(profile.id, {
                linkedinUrl: "https://linkedin.com/in/approved-teacher",
                twitterUrl: "https://twitter.com/approved-teacher",
                isApproved: true,
            });

            // Attempt to change twitterUrl
            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    twitterUrl: "https://twitter.com/changed-teacher",
                });

            assert.equal(res.status, 400);
            assert.match(res.body.message, /Twitter/i);
        });

        it("should retain approvalStatus as REDO when teacher in REDO status updates profile until explicit submission", async () => {
            // Setup a teacher in REDO status with rejectionReason
            const profile = await testCtx.profileRepo.upsertProfile(teacherId, {
                bio: "Old draft bio",
            });
            await testCtx.profileRepo.upsertTeacherProfile(profile.id, {
                linkedinUrl: "https://linkedin.com/in/redo-teacher",
                twitterUrl: "https://twitter.com/redo-teacher",
                approvalStatus: "REDO",
                rejectionReason: "Please update your bio with more details.",
            });

            // Teacher updates their profile
            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    bio: "Updated comprehensive teaching bio with 10 years experience",
                    qualifications: "Ph.D. in Computer Science",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.data.profile.teacherProfile.approvalStatus, "REDO");
        });

        it("should allow approved teacher to update websiteUrl, bio, avatar, name, and expertise", async () => {
            // Setup an approved teacher profile
            const profile = await testCtx.profileRepo.upsertProfile(teacherId, {
                bio: "Old bio",
            });
            await testCtx.profileRepo.upsertTeacherProfile(profile.id, {
                linkedinUrl: "https://linkedin.com/in/approved-teacher",
                twitterUrl: "https://twitter.com/approved-teacher",
                websiteUrl: "https://oldwebsite.com",
                isApproved: true,
            });

            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    name: "Dr. Verified Teacher",
                    bio: "Updated bio after approval",
                    websiteUrl: "https://newwebsite.io",
                    expertise: ["Systems Architecture", "Cloud Native"],
                    linkedinUrl: "https://linkedin.com/in/approved-teacher", // Same as current
                    twitterUrl: "https://twitter.com/approved-teacher", // Same as current
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Teacher profile updated successfully");
            assert.equal(res.body.data.profile.name, "Dr. Verified Teacher");
            assert.equal(res.body.data.profile.profile.bio, "Updated bio after approval");
            assert.equal(res.body.data.profile.teacherProfile.websiteUrl, "https://newwebsite.io");
            assert.deepEqual(res.body.data.profile.teacherProfile.expertise, ["Systems Architecture", "Cloud Native"]);
            assert.equal(res.body.data.profile.teacherProfile.linkedinUrl, "https://linkedin.com/in/approved-teacher");
        });
    });
});
