import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
    FullUserProfile,
    UserProfile,
    TeacherProfile,
    IProfileRepository,
    IUserPasswordRepository,
    ProfileSocialLinksPolicy,
    TeacherVerificationPolicy,
    ProfileValidationPolicy,
    GetProfile,
    UpdateProfile,
    UpdateStudentProfile,
    UpdateTeacherProfile,
    SubmitTeacherVerification,
    ChangePassword,
    GetProfileController,
    UpdateProfileController,
    UpdateStudentProfileController,
    UpdateTeacherProfileController,
    SubmitTeacherVerificationController,
    ChangePasswordController,
    createProfileModule,
    updateProfileSchema,
    updateStudentProfileSchema,
    updateTeacherProfileSchema,
    changePasswordSchema,
    ProfileError,
    ProfileNotFoundError,
    ProfileValidationError,
    ProfileSocialLinksLockedError,
    TeacherVerificationNotEligibleError,
    MaxVerificationAttemptsError,
    PasswordChangeNotAllowedError,
} from "../src/modules/profile";
import { IPasswordService } from "@/infrastructure/security";
import { IEmailService } from "@/infrastructure/email";

// ============================================================================
// IN-MEMORY MOCKS
// ============================================================================

class InMemoryProfileRepository implements IProfileRepository {
    public profiles = new Map<string, UserProfile>();
    public teacherProfiles = new Map<string, TeacherProfile>();
    public users = new Map<string, { id: string; name: string; email: string; role: any; authProvider: any; isBlocked: boolean }>();

    async getFullProfileByUserId(userId: string): Promise<FullUserProfile | null> {
        const user = this.users.get(userId);
        if (!user) return null;

        const profile = this.profiles.get(userId) || null;
        const teacherProfile = profile ? (this.teacherProfiles.get(profile.id) || null) : null;

        return {
            ...user,
            profile,
            teacherProfile,
            createdAt: profile?.createdAt || new Date(),
            updatedAt: profile?.updatedAt || new Date(),
        };
    }

    async getProfileByUserId(userId: string): Promise<UserProfile | null> {
        return this.profiles.get(userId) || null;
    }

    async getTeacherProfileByProfileId(profileId: string): Promise<TeacherProfile | null> {
        return this.teacherProfiles.get(profileId) || null;
    }

    async getTeacherProfileIdByUserId(userId: string): Promise<string | null> {
        const profile = this.profiles.get(userId);
        if (!profile) return null;
        const tp = this.teacherProfiles.get(profile.id);
        return tp?.id || null;
    }

    async upsertProfile(
        userId: string,
        data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<UserProfile> {
        const existing = this.profiles.get(userId);
        const record: UserProfile = {
            id: existing?.id || `prof_${userId}`,
            userId,
            avatar: data.avatar !== undefined ? data.avatar : (existing?.avatar ?? null),
            bio: data.bio !== undefined ? data.bio : (existing?.bio ?? null),
            phone: data.phone !== undefined ? data.phone : (existing?.phone ?? null),
            country: data.country !== undefined ? data.country : (existing?.country ?? null),
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        this.profiles.set(userId, record);
        return { ...record };
    }

    async upsertTeacherProfile(
        profileId: string,
        data: Partial<Omit<TeacherProfile, "id" | "profileId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile> {
        const existing = this.teacherProfiles.get(profileId);
        const record: TeacherProfile = {
            id: existing?.id || `tp_${profileId}`,
            profileId,
            expertise: data.expertise !== undefined ? data.expertise : (existing?.expertise ?? []),
            qualifications: data.qualifications !== undefined ? data.qualifications : (existing?.qualifications ?? null),
            experienceYears: data.experienceYears !== undefined ? data.experienceYears : (existing?.experienceYears ?? null),
            resume: data.resume !== undefined ? data.resume : (existing?.resume ?? null),
            credentials: data.credentials !== undefined ? data.credentials : (existing?.credentials ?? []),
            identityCard: data.identityCard !== undefined ? data.identityCard : (existing?.identityCard ?? null),
            linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : (existing?.linkedinUrl ?? null),
            twitterUrl: data.twitterUrl !== undefined ? data.twitterUrl : (existing?.twitterUrl ?? null),
            websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl : (existing?.websiteUrl ?? null),
            isApproved: data.isApproved !== undefined ? data.isApproved : (existing?.isApproved ?? false),
            approvalStatus: data.approvalStatus !== undefined ? data.approvalStatus : (existing?.approvalStatus ?? "PENDING"),
            rejectionReason: data.rejectionReason !== undefined ? data.rejectionReason : (existing?.rejectionReason ?? null),
            submissionCount: data.submissionCount !== undefined ? data.submissionCount : (existing?.submissionCount ?? 0),
            isInterviewPassed: data.isInterviewPassed !== undefined ? data.isInterviewPassed : (existing?.isInterviewPassed ?? false),
            interviewScore: data.interviewScore !== undefined ? data.interviewScore : (existing?.interviewScore ?? null),
            interviewFeedback: data.interviewFeedback !== undefined ? data.interviewFeedback : (existing?.interviewFeedback ?? null),
            interviewAttempts: data.interviewAttempts !== undefined ? data.interviewAttempts : (existing?.interviewAttempts ?? 0),
            lastInterviewAt: data.lastInterviewAt !== undefined ? data.lastInterviewAt : (existing?.lastInterviewAt ?? null),
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        this.teacherProfiles.set(profileId, record);
        return { ...record };
    }

    async updateUserName(userId: string, name: string): Promise<void> {
        const user = this.users.get(userId);
        if (user) {
            user.name = name;
        }
    }

    async getOrCreateTeacherProfileId(userId: string): Promise<string> {
        let profile = this.profiles.get(userId);
        if (!profile) {
            profile = await this.upsertProfile(userId, {});
        }
        let tp = this.teacherProfiles.get(profile.id);
        if (!tp) {
            tp = await this.upsertTeacherProfile(profile.id, {});
        }
        return tp.id;
    }

    // Base repository stubs
    async findById(id: string): Promise<UserProfile | null> {
        return this.getProfileByUserId(id);
    }
    async findAll(): Promise<UserProfile[]> {
        return Array.from(this.profiles.values());
    }
    async create(data: any): Promise<UserProfile> {
        return this.upsertProfile(data.userId, data);
    }
    async update(id: string, data: any): Promise<UserProfile> {
        return this.upsertProfile(id, data);
    }
    async delete(id: string): Promise<boolean> {
        return this.profiles.delete(id);
    }
}

class InMemoryUserPasswordRepository implements IUserPasswordRepository {
    public users = new Map<string, { id: string; email: string; name: string; authProvider: string; password?: string | null }>();

    async findById(id: string): Promise<{ id: string; email: string; name: string; authProvider: string; password?: string | null } | null> {
        const u = this.users.get(id);
        return u ? { ...u } : null;
    }

    async updatePassword(id: string, passwordHash: string): Promise<any> {
        const u = this.users.get(id);
        if (u) {
            u.password = passwordHash;
        }
        return u;
    }
}

class MockPasswordService implements IPasswordService {
    async hash(password: string): Promise<string> {
        return `hashed_${password}`;
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return hashed === `hashed_${plain}` || hashed === plain;
    }
}

class MockEmailService implements Partial<IEmailService> {
    public sentTeacherStatusUpdates: Array<{ to: string; name: string; status: string }> = [];
    public sentPasswordChangedNotifications: Array<{ to: string; name: string }> = [];

    async sendTeacherStatusUpdate(to: string, name: string, status: string): Promise<any> {
        this.sentTeacherStatusUpdates.push({ to, name, status });
    }

    async sendPasswordChangedNotification(to: string, name: string): Promise<any> {
        this.sentPasswordChangedNotifications.push({ to, name });
    }
}

// ============================================================================
// TESTS SUITE
// ============================================================================

describe("Profile Module - Clean Architecture & SOLID Tests", () => {
    let profileRepo: InMemoryProfileRepository;
    let userPasswordRepo: InMemoryUserPasswordRepository;
    let passwordService: MockPasswordService;
    let emailService: MockEmailService;

    beforeEach(() => {
        profileRepo = new InMemoryProfileRepository();
        userPasswordRepo = new InMemoryUserPasswordRepository();
        passwordService = new MockPasswordService();
        emailService = new MockEmailService();
    });

    // ------------------------------------------------------------------------
    // 1. DOMAIN POLICIES TESTS
    // ------------------------------------------------------------------------
    describe("Domain Policies", () => {
        describe("ProfileSocialLinksPolicy", () => {
            it("identifies locked status correctly", () => {
                assert.equal(ProfileSocialLinksPolicy.isLocked("IN_PROGRESS", false), true);
                assert.equal(ProfileSocialLinksPolicy.isLocked("VERIFIED", false), true);
                assert.equal(ProfileSocialLinksPolicy.isLocked("PENDING", true), true);
                assert.equal(ProfileSocialLinksPolicy.isLocked("PENDING", false), false);
                assert.equal(ProfileSocialLinksPolicy.isLocked("REDO", false), false);
            });

            it("allows social link modifications when unlocked", () => {
                assert.doesNotThrow(() => {
                    ProfileSocialLinksPolicy.assertCanModifySocialLinks({
                        teacherProfile: {
                            approvalStatus: "PENDING",
                            isApproved: false,
                            linkedinUrl: "https://linkedin.com/in/old",
                            twitterUrl: "https://x.com/old",
                        } as any,
                        incomingLinkedin: "https://linkedin.com/in/new",
                        incomingTwitter: "https://x.com/new",
                    });
                });
            });

            it("throws ProfileSocialLinksLockedError when IN_PROGRESS teacher modifies LinkedIn", () => {
                assert.throws(
                    () => {
                        ProfileSocialLinksPolicy.assertCanModifySocialLinks({
                            teacherProfile: {
                                approvalStatus: "IN_PROGRESS",
                                isApproved: false,
                                linkedinUrl: "https://linkedin.com/in/old",
                            } as any,
                            incomingLinkedin: "https://linkedin.com/in/new",
                        });
                    },
                    (err: any) => {
                        assert.ok(err instanceof ProfileSocialLinksLockedError);
                        assert.match(err.message, /under evaluation/i);
                        return true;
                    }
                );
            });

            it("throws ProfileSocialLinksLockedError when VERIFIED teacher modifies Twitter", () => {
                assert.throws(
                    () => {
                        ProfileSocialLinksPolicy.assertCanModifySocialLinks({
                            teacherProfile: {
                                approvalStatus: "VERIFIED",
                                isApproved: true,
                                twitterUrl: "https://x.com/old",
                            } as any,
                            incomingTwitter: "https://x.com/new",
                        });
                    },
                    (err: any) => {
                        assert.ok(err instanceof ProfileSocialLinksLockedError);
                        assert.match(err.message, /approved by an administrator/i);
                        return true;
                    }
                );
            });

            it("does not throw when locked teacher provides identical trimmed URLs", () => {
                assert.doesNotThrow(() => {
                    ProfileSocialLinksPolicy.assertCanModifySocialLinks({
                        teacherProfile: {
                            approvalStatus: "VERIFIED",
                            isApproved: true,
                            linkedinUrl: "https://linkedin.com/in/same",
                            twitterUrl: "https://x.com/same",
                        } as any,
                        incomingLinkedin: "  https://linkedin.com/in/same  ",
                        incomingTwitter: "https://x.com/same",
                    });
                });
            });

            it("resolves effective URLs: keeps existing when locked, uses incoming when unlocked", () => {
                const lockedResult = ProfileSocialLinksPolicy.resolveEffectiveUrls({
                    teacherProfile: {
                        approvalStatus: "VERIFIED",
                        isApproved: true,
                        linkedinUrl: "https://linkedin.com/in/original",
                        twitterUrl: "https://x.com/original",
                    } as any,
                    incomingLinkedin: "https://linkedin.com/in/changed",
                    incomingTwitter: "https://x.com/changed",
                });
                assert.equal(lockedResult.linkedinUrl, "https://linkedin.com/in/original");
                assert.equal(lockedResult.twitterUrl, "https://x.com/original");

                const unlockedResult = ProfileSocialLinksPolicy.resolveEffectiveUrls({
                    teacherProfile: {
                        approvalStatus: "PENDING",
                        isApproved: false,
                        linkedinUrl: "https://linkedin.com/in/original",
                    } as any,
                    incomingLinkedin: "https://linkedin.com/in/changed",
                });
                assert.equal(unlockedResult.linkedinUrl, "https://linkedin.com/in/changed");
            });
        });

        describe("TeacherVerificationPolicy", () => {
            it("throws when role is not TEACHER", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "STUDENT",
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof TeacherVerificationNotEligibleError);
                        assert.match(err.message, /only instructor accounts/i);
                        return true;
                    }
                );
            });

            it("throws when status is already IN_PROGRESS", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "TEACHER",
                            teacherProfile: { approvalStatus: "IN_PROGRESS" },
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof TeacherVerificationNotEligibleError);
                        assert.match(err.message, /already actively under review/i);
                        return true;
                    }
                );
            });

            it("throws when status is already VERIFIED", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "TEACHER",
                            teacherProfile: { approvalStatus: "VERIFIED" },
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof TeacherVerificationNotEligibleError);
                        assert.match(err.message, /already verified and approved/i);
                        return true;
                    }
                );
            });

            it("throws MaxVerificationAttemptsError when attempts >= 5", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "TEACHER",
                            teacherProfile: {
                                approvalStatus: "PENDING",
                                submissionCount: 5,
                            },
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof MaxVerificationAttemptsError);
                        assert.match(err.message, /maximum verification submission limit/i);
                        return true;
                    }
                );
            });

            it("throws when bio and qualifications are both missing", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "TEACHER",
                            teacherProfile: {
                                approvalStatus: "PENDING",
                                submissionCount: 0,
                                expertise: ["Web Development"],
                                qualifications: [],
                            },
                            profile: { bio: "" },
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof TeacherVerificationNotEligibleError);
                        assert.match(err.message, /provide your qualifications or a brief biography/i);
                        return true;
                    }
                );
            });

            it("throws when expertise array is empty", () => {
                assert.throws(
                    () => {
                        TeacherVerificationPolicy.assertEligibility({
                            role: "TEACHER",
                            teacherProfile: {
                                approvalStatus: "PENDING",
                                submissionCount: 0,
                                expertise: [],
                            },
                            profile: { bio: "Experienced instructor" },
                        } as any);
                    },
                    (err: any) => {
                        assert.ok(err instanceof TeacherVerificationNotEligibleError);
                        assert.match(err.message, /select at least one domain of expertise/i);
                        return true;
                    }
                );
            });

            it("passes assertion when teacher profile is valid and eligible", () => {
                assert.doesNotThrow(() => {
                    TeacherVerificationPolicy.assertEligibility({
                        role: "TEACHER",
                        teacherProfile: {
                            approvalStatus: "PENDING",
                            submissionCount: 1,
                            expertise: ["Web Development"],
                            qualifications: [{ title: "BSc CS", year: "2020" }],
                        },
                        profile: { bio: "Senior engineer" },
                    } as any);
                });
            });

            it("calculates next attempt count correctly", () => {
                assert.equal(TeacherVerificationPolicy.calculateNextAttemptCount(0), 1);
                assert.equal(TeacherVerificationPolicy.calculateNextAttemptCount(3), 4);
            });
        });

        describe("ProfileValidationPolicy", () => {
            it("validates display name bounds", () => {
                assert.doesNotThrow(() => ProfileValidationPolicy.validateName("John"));
                assert.throws(
                    () => ProfileValidationPolicy.validateName("J"),
                    (err: any) => err instanceof ProfileValidationError
                );
                assert.throws(
                    () => ProfileValidationPolicy.validateName("A".repeat(101)),
                    (err: any) => err instanceof ProfileValidationError
                );
            });

            it("validates bio length", () => {
                assert.doesNotThrow(() => ProfileValidationPolicy.validateBio("Short bio"));
                assert.throws(
                    () => ProfileValidationPolicy.validateBio("B".repeat(1001)),
                    (err: any) => err instanceof ProfileValidationError
                );
            });

            it("validates experience years", () => {
                assert.doesNotThrow(() => ProfileValidationPolicy.validateExperienceYears(5));
                assert.throws(
                    () => ProfileValidationPolicy.validateExperienceYears(-1),
                    (err: any) => err instanceof ProfileValidationError
                );
                assert.throws(
                    () => ProfileValidationPolicy.validateExperienceYears(85),
                    (err: any) => err instanceof ProfileValidationError
                );
                assert.throws(
                    () => ProfileValidationPolicy.validateExperienceYears(3.5),
                    (err: any) => err instanceof ProfileValidationError
                );
            });
        });
    });

    // ------------------------------------------------------------------------
    // 2. PRESENTATION SCHEMAS TESTS
    // ------------------------------------------------------------------------
    describe("Presentation Schemas", () => {
        it("validates updateProfileSchema with valid data", () => {
            const parsed = updateProfileSchema.parse({
                name: "Alice Developer",
                bio: "Full stack engineer",
                experienceYears: "5",
                websiteUrl: "https://alice.dev",
            });
            assert.equal(parsed.name, "Alice Developer");
            assert.equal(parsed.experienceYears, 5);
        });

        it("validates updateStudentProfileSchema", () => {
            const parsed = updateStudentProfileSchema.parse({
                name: "Bob Student",
                bio: "Learning TypeScript",
                phone: "+1234567890",
            });
            assert.equal(parsed.name, "Bob Student");
        });

        it("validates updateTeacherProfileSchema with expertise and qualifications", () => {
            const parsed = updateTeacherProfileSchema.parse({
                name: "Charlie Teacher",
                expertise: ["Web Development", "Artificial Intelligence"],
                qualifications: [
                    { title: "Master of Science", year: "2021", institution: "MIT" },
                ],
                websiteUrl: "https://charlie.edu",
            });
            assert.equal(parsed.name, "Charlie Teacher");
            assert.equal(parsed.expertise?.length, 2);
        });

        it("validates changePasswordSchema", () => {
            const valid = changePasswordSchema.parse({
                currentPassword: "OldPassword1!",
                newPassword: "NewPassword123",
                confirmPassword: "NewPassword123",
            });
            assert.equal(valid.newPassword, "NewPassword123");

            assert.throws(() => {
                changePasswordSchema.parse({
                    currentPassword: "OldPassword1!",
                    newPassword: "NewPassword123",
                    confirmPassword: "MismatchPassword123",
                });
            });
        });
    });

    // ------------------------------------------------------------------------
    // 3. APPLICATION USE CASES TESTS
    // ------------------------------------------------------------------------
    describe("Application Use Cases", () => {
        describe("GetProfile", () => {
            it("returns full profile when user exists", async () => {
                profileRepo.users.set("u1", {
                    id: "u1",
                    name: "Alice",
                    email: "alice@example.com",
                    role: "STUDENT",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });
                await profileRepo.upsertProfile("u1", { bio: "Hello world" });

                const useCase = new GetProfile(profileRepo);
                const result = await useCase.execute("u1");

                assert.equal(result.id, "u1");
                assert.equal(result.profile?.bio, "Hello world");
            });

            it("throws ProfileNotFoundError when user does not exist", async () => {
                const useCase = new GetProfile(profileRepo);
                await assert.rejects(
                    async () => useCase.execute("non_existent"),
                    ProfileNotFoundError
                );
            });
        });

        describe("UpdateProfile", () => {
            beforeEach(async () => {
                profileRepo.users.set("u1", {
                    id: "u1",
                    name: "Old Name",
                    email: "u1@example.com",
                    role: "STUDENT",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });
                await profileRepo.upsertProfile("u1", { bio: "Old bio" });
            });

            it("updates name, bio, and returns full profile", async () => {
                const useCase = new UpdateProfile(profileRepo);
                const result = await useCase.execute("u1", {
                    name: "New Name",
                    bio: "Updated bio",
                });

                assert.equal(result.name, "New Name");
                assert.equal(result.profile?.bio, "Updated bio");
            });

            it("blocks modifying social links if instructor profile is locked", async () => {
                profileRepo.users.set("u2", {
                    id: "u2",
                    name: "Teacher",
                    email: "t@example.com",
                    role: "TEACHER",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });
                const prof = await profileRepo.upsertProfile("u2", {});
                await profileRepo.upsertTeacherProfile(prof.id, {
                    isApproved: true,
                    approvalStatus: "VERIFIED",
                    linkedinUrl: "https://linkedin.com/in/original",
                });

                const useCase = new UpdateProfile(profileRepo);
                await assert.rejects(
                    async () =>
                        useCase.execute("u2", {
                            linkedinUrl: "https://linkedin.com/in/changed",
                        }),
                    ProfileSocialLinksLockedError
                );
            });
        });

        describe("UpdateStudentProfile", () => {
            it("updates student profile record", async () => {
                profileRepo.users.set("s1", {
                    id: "s1",
                    name: "Student 1",
                    email: "s1@example.com",
                    role: "STUDENT",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });

                const useCase = new UpdateStudentProfile(profileRepo);
                const result = await useCase.execute("s1", {
                    name: "Updated Student",
                    bio: "Studying Web Dev",
                    country: "India",
                });

                assert.equal(result.name, "Updated Student");
                assert.equal(result.profile?.country, "India");
            });
        });

        describe("UpdateTeacherProfile", () => {
            it("updates teacher profile expertise and qualifications", async () => {
                profileRepo.users.set("t1", {
                    id: "t1",
                    name: "Teacher 1",
                    email: "t1@example.com",
                    role: "TEACHER",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });

                const useCase = new UpdateTeacherProfile(profileRepo);
                const result = await useCase.execute("t1", {
                    name: "Prof. Smith",
                    expertise: ["Web Development"],
                    experienceYears: 10,
                    websiteUrl: "https://smith.edu",
                });

                assert.equal(result.name, "Prof. Smith");
                assert.equal(result.teacherProfile?.experienceYears, 10);
                assert.equal(result.teacherProfile?.websiteUrl, "https://smith.edu");
            });
        });

        describe("SubmitTeacherVerification", () => {
            beforeEach(async () => {
                profileRepo.users.set("t1", {
                    id: "t1",
                    name: "Instructor Dave",
                    email: "dave@example.com",
                    role: "TEACHER",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });
                const prof = await profileRepo.upsertProfile("t1", {
                    bio: "Over 8 years in full-stack architecture.",
                });
                await profileRepo.upsertTeacherProfile(prof.id, {
                    approvalStatus: "PENDING",
                    submissionCount: 0,
                    expertise: ["Web Development"],
                });
            });

            it("successfully submits verification, transitions status to IN_PROGRESS and dispatches email", async () => {
                const useCase = new SubmitTeacherVerification(profileRepo, emailService as any);
                const result = await useCase.execute("t1");

                assert.equal(result.profile.teacherProfile?.approvalStatus, "IN_PROGRESS");
                assert.equal(result.profile.teacherProfile?.submissionCount, 1);
                assert.match(result.message, /successfully/i);
                assert.equal(emailService.sentTeacherStatusUpdates.length, 1);
                assert.equal(emailService.sentTeacherStatusUpdates[0].status, "IN_PROGRESS");
            });

            it("rejects non-teacher account with TeacherVerificationNotEligibleError", async () => {
                profileRepo.users.set("s1", {
                    id: "s1",
                    name: "Student",
                    email: "student@example.com",
                    role: "STUDENT",
                    authProvider: "LOCAL",
                    isBlocked: false,
                });
                await profileRepo.upsertProfile("s1", { bio: "I am a student" });

                const useCase = new SubmitTeacherVerification(profileRepo, emailService as any);
                await assert.rejects(
                    async () => useCase.execute("s1"),
                    TeacherVerificationNotEligibleError
                );
            });
        });

        describe("ChangePassword", () => {
            beforeEach(() => {
                userPasswordRepo.users.set("u1", {
                    id: "u1",
                    email: "user@example.com",
                    name: "User",
                    authProvider: "LOCAL",
                    password: "hashed_OldPassword123",
                });
            });

            it("successfully changes password, updates hash, and sends notification email", async () => {
                const useCase = new ChangePassword(userPasswordRepo, passwordService, emailService as any);
                const result = await useCase.execute({
                    userId: "u1",
                    currentPassword: "OldPassword123",
                    newPassword: "NewSecretPassword456",
                });

                assert.equal(result.success, true);
                const updatedUser = userPasswordRepo.users.get("u1");
                assert.equal(updatedUser?.password, "hashed_NewSecretPassword456");
                assert.equal(emailService.sentPasswordChangedNotifications.length, 1);
            });

            it("rejects password change for Google SSO accounts", async () => {
                userPasswordRepo.users.set("g1", {
                    id: "g1",
                    email: "google@example.com",
                    name: "Google User",
                    authProvider: "GOOGLE",
                });

                const useCase = new ChangePassword(userPasswordRepo, passwordService, emailService as any);
                await assert.rejects(
                    async () =>
                        useCase.execute({
                            userId: "g1",
                            newPassword: "NewPassword123",
                        }),
                    PasswordChangeNotAllowedError
                );
            });

            it("rejects if current password is incorrect", async () => {
                const useCase = new ChangePassword(userPasswordRepo, passwordService, emailService as any);
                await assert.rejects(
                    async () =>
                        useCase.execute({
                            userId: "u1",
                            currentPassword: "WrongPassword123",
                            newPassword: "NewPassword123",
                        }),
                    PasswordChangeNotAllowedError
                );
            });

            it("rejects if new password is identical to current password", async () => {
                const useCase = new ChangePassword(userPasswordRepo, passwordService, emailService as any);
                await assert.rejects(
                    async () =>
                        useCase.execute({
                            userId: "u1",
                            currentPassword: "OldPassword123",
                            newPassword: "OldPassword123",
                        }),
                    PasswordChangeNotAllowedError
                );
            });
        });
    });

    // ------------------------------------------------------------------------
    // 4. PRESENTATION CONTROLLERS & MODULE FACTORY TESTS
    // ------------------------------------------------------------------------
    describe("Presentation Controllers & Module Factory", () => {
        it("createProfileModule successfully instantiates module dependencies and routes", () => {
            const module = createProfileModule({
                profileRepository: profileRepo,
                userRepository: userPasswordRepo,
                passwordService,
                emailService: emailService as any,
            });

            assert.ok(module.repository);
            assert.ok(module.useCases.getProfile);
            assert.ok(module.useCases.updateProfile);
            assert.ok(module.useCases.changePassword);
            assert.ok(module.controllers.getProfileController);
            assert.ok(module.router);
        });

        it("GetProfileController throws UnauthorizedError when user is missing from request", async () => {
            const useCase = new GetProfile(profileRepo);
            const controller = new GetProfileController(useCase);

            const req = { user: undefined } as any;
            const res = {} as any;
            let caughtError: any;
            const next = (err: any) => {
                caughtError = err;
            };

            await controller.execute(req, res, next);
            assert.ok(caughtError);
            assert.equal(caughtError.statusCode, 401);
        });

        it("GetProfileController returns ApiResponse.success when user is authenticated", async () => {
            profileRepo.users.set("u1", {
                id: "u1",
                name: "Test User",
                email: "test@example.com",
                role: "STUDENT",
                authProvider: "LOCAL",
                isBlocked: false,
            });

            const useCase = new GetProfile(profileRepo);
            const controller = new GetProfileController(useCase);

            const req = { user: { userId: "u1" } } as any;
            let responseData: any;
            const res = {
                status: (code: number) => ({
                    json: (data: any) => {
                        responseData = { code, ...data };
                        return responseData;
                    },
                }),
            } as any;
            const next = () => {};

            await controller.execute(req, res, next);
            assert.equal(responseData.code, 200);
            assert.equal(responseData.data.profile.id, "u1");
        });
    });
});
