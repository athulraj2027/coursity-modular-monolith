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
                    headline: "Aspiring Full Stack Engineer",
                    education: "B.Tech Computer Science",
                    interests: ["Node.js", "React", "Docker"],
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Updated");
            assert.equal(res.body.data.profile.studentProfile.headline, "Aspiring Full Stack Engineer");
            assert.equal(res.body.data.profile.studentProfile.education, "B.Tech Computer Science");
            assert.deepEqual(res.body.data.profile.studentProfile.interests, ["Node.js", "React", "Docker"]);
        });

        it("should update student profile using PUT /api/profile", async () => {
            const res = await request(testCtx.app)
                .put("/api/profile")
                .set("Authorization", `Bearer ${studentToken}`)
                .send({
                    name: "Alice Put Name",
                    bio: "Passionate lifelong learner",
                    headline: "Frontend Specialist",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Put Name");
            assert.equal(res.body.data.profile.studentProfile.bio, "Passionate lifelong learner");
            assert.equal(res.body.data.profile.studentProfile.headline, "Frontend Specialist");
        });

        it("should update teacher profile using PATCH /api/profile", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    name: "Dr. Bob",
                    headline: "Lead Cloud Architect & Instructor",
                    expertise: ["Distributed Systems", "Kubernetes", "PostgreSQL"],
                    experienceYears: 12,
                    websiteUrl: "https://drbob.io",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Profile updated successfully");
            assert.equal(res.body.data.profile.name, "Dr. Bob");
            assert.equal(res.body.data.profile.teacherProfile.headline, "Lead Cloud Architect & Instructor");
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
                    headline: "Data Science Enthusiast",
                    education: "Stanford University",
                    interests: ["Python", "Machine Learning"],
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Student profile updated successfully");
            assert.equal(res.body.data.profile.name, "Alice Dedicated Student");
            assert.equal(res.body.data.profile.studentProfile.headline, "Data Science Enthusiast");
            assert.equal(res.body.data.profile.studentProfile.education, "Stanford University");
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
            assert.equal(res.body.data.profile.studentProfile.phone, "+1234567890");
            assert.equal(res.body.data.profile.studentProfile.bio, "Studying AI/ML and Cloud Computing");
        });
    });

    describe("PUT & PATCH /api/profile/teacher", () => {
        it("should update teacher profile via PUT /api/profile/teacher", async () => {
            const res = await request(testCtx.app)
                .put("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    name: "Professor Bob",
                    headline: "Principal Systems Engineer",
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
            assert.equal(res.body.data.profile.teacherProfile.qualifications, "Ph.D. in Computer Science");
            assert.equal(res.body.data.profile.teacherProfile.experienceYears, 15);
            assert.equal(res.body.data.profile.teacherProfile.linkedinUrl, "https://linkedin.com/in/profbob");
        });

        it("should update teacher profile via PATCH /api/profile/teacher", async () => {
            const res = await request(testCtx.app)
                .patch("/api/profile/teacher")
                .set("Authorization", `Bearer ${teacherToken}`)
                .send({
                    bio: "20 years instructing senior software engineering professionals.",
                });

            assert.equal(res.status, 200);
            assert.equal(res.body.message, "Teacher profile updated successfully");
            assert.equal(res.body.data.profile.teacherProfile.bio, "20 years instructing senior software engineering professionals.");
        });
    });
});
