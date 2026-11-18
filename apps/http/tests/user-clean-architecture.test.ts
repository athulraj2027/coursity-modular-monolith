import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
    User,
    UserRole,
    ApprovalStatus,
    TeacherApprovalPolicy,
    UserBlockPolicy,
    ALLOWED_APPROVAL_TRANSITIONS,
    UserError,
    UserNotFoundError,
    AdminBlockNotAllowedError,
    NonTeacherApprovalError,
    InvalidApprovalTransitionError,
    ApprovalFeedbackRequiredError,
    CurrentPasswordRequiredError,
    InvalidCurrentPasswordError,
    updateProfileSchema,
    changePasswordSchema,
    getUsersQuerySchema,
    approveTeacherSchema,
    GetProfile,
    GetUserById,
    GetAllUsers,
    UpdateProfile,
    DeleteUser,
    ChangePassword,
    BlockUser,
    ApproveTeacher,
    GetAdminAnalytics,
    createUserModule,
    IUserRepository,
    IAdminAnalyticsRepository,
} from "../src/modules/user";
import { IPasswordService } from "@/infrastructure/security";
import { TokenRepository } from "@/modules/auth/domain/repositories/token.repository";
import { IEmailService } from "@/infrastructure/email";

// In-memory test double for IUserRepository
class InMemoryUserRepository implements IUserRepository {
    public users: Map<string, User> = new Map();

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                return user;
            }
        }
        return null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.googleId === googleId) {
                return user;
            }
        }
        return null;
    }

    async create(data: any): Promise<User> {
        const id = data.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const user: User = {
            id,
            name: data.name,
            email: data.email,
            password: data.password || null,
            role: data.role || "STUDENT",
            authProvider: data.authProvider || "LOCAL",
            googleId: data.googleId || null,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: data.profile || null,
        };
        this.users.set(id, user);
        return user;
    }

    async update(id: string, data: any): Promise<User> {
        const existing = this.users.get(id);
        if (!existing) {
            throw new Error(`User ${id} not found in in-memory repo`);
        }
        const updated: User = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        };
        this.users.set(id, updated);
        return updated;
    }

    async updatePassword(id: string, newPasswordHash: string): Promise<User> {
        return this.update(id, { password: newPasswordHash });
    }

    async updateBlockStatus(id: string, isBlocked: boolean): Promise<User> {
        return this.update(id, { isBlocked });
    }

    async updateTeacherApproval(userId: string, data: any): Promise<User> {
        const existing = this.users.get(userId);
        if (!existing) {
            throw new Error(`User ${userId} not found in in-memory repo`);
        }

        let approvalStatus: ApprovalStatus = "PENDING";
        let isApproved = false;
        let rejectionReason: string | null = null;

        if (typeof data === "boolean") {
            isApproved = data;
            approvalStatus = data ? "VERIFIED" : "REVOKED";
        } else {
            approvalStatus = data.approvalStatus || (data.isApproved ? "VERIFIED" : "PENDING");
            isApproved = approvalStatus === "VERIFIED" || Boolean(data.isApproved);
            rejectionReason = data.rejectionReason ?? null;
        }

        const teacherProfile = {
            ...(existing.profile?.teacherProfile || {
                id: `tp-${userId}`,
                profileId: `p-${userId}`,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            approvalStatus,
            isApproved,
            rejectionReason,
        };

        const updated: User = {
            ...existing,
            profile: {
                ...(existing.profile || {
                    id: `p-${userId}`,
                    userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                teacherProfile,
            },
            updatedAt: new Date(),
        };
        this.users.set(userId, updated);
        return updated;
    }

    async findMany(options?: any): Promise<any> {
        const list = Array.from(this.users.values());
        return {
            users: list,
            pagination: {
                total: list.length,
                page: options?.page || 1,
                limit: options?.limit || 10,
                totalPages: Math.ceil(list.length / (options?.limit || 10)),
            },
        };
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    async count(): Promise<number> {
        return this.users.size;
    }
}

// In-memory test double for PasswordService
class MockPasswordService implements IPasswordService {
    async hash(password: string): Promise<string> {
        return `hashed_${password}`;
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return hash === `hashed_${password}` || hash === password;
    }
}

// In-memory test double for TokenRepository
class MockTokenRepository implements Partial<TokenRepository> {
    public deletedTokens: string[] = [];

    async deleteRefreshToken(userId: string): Promise<void> {
        this.deletedTokens.push(userId);
    }
}

// Mock EmailService
class MockEmailService implements Partial<IEmailService> {
    public sentEmails: Array<{ to: string; status: string; reason?: string | null }> = [];

    async sendTeacherStatusUpdate(to: string, name: string, status: any, reason?: string | null): Promise<void> {
        this.sentEmails.push({ to, status, reason });
    }
}

// Mock AdminAnalyticsRepository
class MockAdminAnalyticsRepository implements IAdminAnalyticsRepository {
    async getAnalyticsData(): Promise<any> {
        return {
            stats: { totalRevenue: 1000, activeStudents: 50, instructors: 5 },
            overview: [],
            breakdown: [],
        };
    }
}

describe("User Module Clean Architecture & SOLID Tests", () => {
    let userRepo: InMemoryUserRepository;
    let passwordService: MockPasswordService;
    let tokenRepo: MockTokenRepository;
    let emailService: MockEmailService;
    let analyticsRepo: MockAdminAnalyticsRepository;

    beforeEach(() => {
        userRepo = new InMemoryUserRepository();
        passwordService = new MockPasswordService();
        tokenRepo = new MockTokenRepository();
        emailService = new MockEmailService();
        analyticsRepo = new MockAdminAnalyticsRepository();
    });

    describe("1. Pure Domain Policies", () => {
        describe("TeacherApprovalPolicy", () => {
            it("should validate feedback length requirements for REVOKED and REDO", () => {
                // Must fail if missing or too short
                assert.throws(
                    () => TeacherApprovalPolicy.validateFeedback("REVOKED", ""),
                    (err: any) => err instanceof ApprovalFeedbackRequiredError
                );
                assert.throws(
                    () => TeacherApprovalPolicy.validateFeedback("REDO", "bad"),
                    (err: any) => err instanceof ApprovalFeedbackRequiredError
                );

                // Should succeed when 5+ chars
                assert.doesNotThrow(() =>
                    TeacherApprovalPolicy.validateFeedback("REVOKED", "Needs clearer audio equipment")
                );
                assert.doesNotThrow(() =>
                    TeacherApprovalPolicy.validateFeedback("REDO", "Please re-upload higher quality certificate")
                );

                // VERIFIED does not require feedback
                assert.doesNotThrow(() => TeacherApprovalPolicy.validateFeedback("VERIFIED", null));
            });

            it("should enforce valid transition state machine", () => {
                // Allowed transitions
                assert.doesNotThrow(() => TeacherApprovalPolicy.validateTransition("IN_PROGRESS", "VERIFIED"));
                assert.doesNotThrow(() => TeacherApprovalPolicy.validateTransition("IN_PROGRESS", "REDO"));
                assert.doesNotThrow(() => TeacherApprovalPolicy.validateTransition("VERIFIED", "REVOKED"));
                assert.doesNotThrow(() => TeacherApprovalPolicy.validateTransition("REVOKED", "PENDING"));

                // Disallowed from PENDING (draft application)
                assert.throws(
                    () => TeacherApprovalPolicy.validateTransition("PENDING", "VERIFIED"),
                    (err: any) =>
                        err instanceof InvalidApprovalTransitionError &&
                        err.message.includes("currently in draft (Pending)")
                );

                // Disallowed from REDO (needs resubmission)
                assert.throws(
                    () => TeacherApprovalPolicy.validateTransition("REDO", "VERIFIED"),
                    (err: any) =>
                        err instanceof InvalidApprovalTransitionError &&
                        err.message.includes("currently marked for revision (Redo)")
                );

                // Disallowed direct transition
                assert.throws(
                    () => TeacherApprovalPolicy.validateTransition("VERIFIED", "IN_PROGRESS"),
                    (err: any) => err instanceof InvalidApprovalTransitionError
                );
            });

            it("should format correct action messages", () => {
                assert.strictEqual(
                    TeacherApprovalPolicy.formatActionMessage("VERIFIED"),
                    "Instructor has been verified and approved successfully"
                );
                assert.strictEqual(
                    TeacherApprovalPolicy.formatActionMessage("IN_PROGRESS"),
                    "Instructor application marked as in progress"
                );
                assert.strictEqual(
                    TeacherApprovalPolicy.formatActionMessage("REVOKED"),
                    "Instructor verification has been revoked with feedback"
                );
                assert.strictEqual(
                    TeacherApprovalPolicy.formatActionMessage("REDO"),
                    "Instructor application marked for revision (redo) with feedback"
                );
                assert.strictEqual(
                    TeacherApprovalPolicy.formatActionMessage("PENDING"),
                    "Instructor application status reset to pending"
                );
            });
        });

        describe("UserBlockPolicy", () => {
            it("should disallow blocking an ADMIN account", () => {
                assert.throws(
                    () => UserBlockPolicy.validateBlockAllowed("ADMIN", true),
                    (err: any) => err instanceof AdminBlockNotAllowedError
                );

                // Unblocking admin is allowed
                assert.doesNotThrow(() => UserBlockPolicy.validateBlockAllowed("ADMIN", false));

                // Blocking student or teacher is allowed
                assert.doesNotThrow(() => UserBlockPolicy.validateBlockAllowed("STUDENT", true));
                assert.doesNotThrow(() => UserBlockPolicy.validateBlockAllowed("TEACHER", true));
            });

            it("should toggle or use provided block status correctly", () => {
                // When status is explicitly passed
                assert.strictEqual(UserBlockPolicy.determineTargetStatus(false, true), true);
                assert.strictEqual(UserBlockPolicy.determineTargetStatus(true, false), false);

                // When status is omitted (toggles)
                assert.strictEqual(UserBlockPolicy.determineTargetStatus(false, undefined), true);
                assert.strictEqual(UserBlockPolicy.determineTargetStatus(true, undefined), false);
            });

            it("should format action message correctly", () => {
                assert.strictEqual(UserBlockPolicy.formatBlockMessage(true), "User has been blocked successfully");
                assert.strictEqual(UserBlockPolicy.formatBlockMessage(false), "User has been unblocked successfully");
            });
        });
    });

    describe("2. Domain Errors", () => {
        it("should initialize domain errors with correct properties and status codes", () => {
            const notFound = new UserNotFoundError("Custom not found");
            assert.strictEqual(notFound.statusCode, 404);
            assert.strictEqual(notFound.name, "UserNotFoundError");

            const adminBlock = new AdminBlockNotAllowedError();
            assert.strictEqual(adminBlock.statusCode, 400);

            const nonTeacher = new NonTeacherApprovalError();
            assert.strictEqual(nonTeacher.statusCode, 400);

            const invalidTransition = new InvalidApprovalTransitionError("Bad transition");
            assert.strictEqual(invalidTransition.statusCode, 400);

            const feedbackReq = new ApprovalFeedbackRequiredError();
            assert.strictEqual(feedbackReq.statusCode, 400);

            const badPassword = new InvalidCurrentPasswordError();
            assert.strictEqual(badPassword.statusCode, 400);

            const reqPassword = new CurrentPasswordRequiredError();
            assert.strictEqual(reqPassword.statusCode, 400);

            const baseError = new UserError("Base user error");
            assert.strictEqual(baseError.name, "UserError");
        });
    });

    describe("3. Presentation Validation Schemas", () => {
        it("should validate updateProfileSchema", () => {
            const valid = updateProfileSchema.safeParse({ name: "Alice Smith" });
            assert.strictEqual(valid.success, true);

            const tooShort = updateProfileSchema.safeParse({ name: "A" });
            assert.strictEqual(tooShort.success, false);
        });

        it("should validate changePasswordSchema", () => {
            const valid = changePasswordSchema.safeParse({
                currentPassword: "oldpassword",
                newPassword: "newsecretpassword",
            });
            assert.strictEqual(valid.success, true);

            const tooShort = changePasswordSchema.safeParse({
                newPassword: "123",
            });
            assert.strictEqual(tooShort.success, false);
        });

        it("should validate getUsersQuerySchema", () => {
            const result = getUsersQuerySchema.parse({
                page: "2",
                limit: "25",
                role: "TEACHER",
                approvalStatus: "in-progress",
                isApproved: "true",
            });
            assert.strictEqual(result.page, 2);
            assert.strictEqual(result.limit, 25);
            assert.strictEqual(result.approvalStatus, "IN_PROGRESS");
            assert.strictEqual(result.isApproved, true);
        });

        it("should validate approveTeacherSchema refinement", () => {
            const validApproval = approveTeacherSchema.safeParse({
                approvalStatus: "VERIFIED",
            });
            assert.strictEqual(validApproval.success, true);

            // Revoked without feedback must fail
            const invalidRevoke = approveTeacherSchema.safeParse({
                approvalStatus: "REVOKED",
                rejectionReason: "no",
            });
            assert.strictEqual(invalidRevoke.success, false);

            // Revoked with feedback must succeed
            const validRevoke = approveTeacherSchema.safeParse({
                approvalStatus: "REVOKED",
                rejectionReason: "Incomplete documentation provided",
            });
            assert.strictEqual(validRevoke.success, true);
        });
    });

    describe("4. Application Use Cases (DIP & ISP)", () => {
        it("GetProfile & GetUserById should return user without password, or throw UserNotFoundError", async () => {
            await userRepo.create({
                id: "u-1",
                name: "John Doe",
                email: "john@example.com",
                password: "hashed_secret",
            });

            const getProfile = new GetProfile(userRepo);
            const userProfile = await getProfile.execute("u-1");
            assert.strictEqual(userProfile.id, "u-1");
            assert.strictEqual(userProfile.name, "John Doe");
            assert.strictEqual((userProfile as any).password, undefined);

            const getUserById = new GetUserById(userRepo);
            const userById = await getUserById.execute("u-1");
            assert.strictEqual(userById.id, "u-1");
            assert.strictEqual((userById as any).password, undefined);

            await assert.rejects(
                () => getProfile.execute("non-existent"),
                (err: any) => err instanceof UserNotFoundError
            );
            await assert.rejects(
                () => getUserById.execute("non-existent"),
                (err: any) => err instanceof UserNotFoundError
            );
        });

        it("UpdateProfile & DeleteUser should update and remove user correctly", async () => {
            await userRepo.create({
                id: "u-2",
                name: "Jane Original",
                email: "jane@example.com",
            });

            const updateProfile = new UpdateProfile(userRepo);
            const updated = await updateProfile.execute("u-2", { name: "Jane Updated" });
            assert.strictEqual(updated.name, "Jane Updated");

            const deleteUser = new DeleteUser(userRepo);
            const deleteRes = await deleteUser.execute("u-2");
            assert.strictEqual(deleteRes.success, true);

            const found = await userRepo.findById("u-2");
            assert.strictEqual(found, null);
        });

        it("ChangePassword should verify old password, hash new password, and update", async () => {
            await userRepo.create({
                id: "u-3",
                name: "Secure User",
                email: "secure@example.com",
                password: "hashed_oldpass",
            });

            const changePassword = new ChangePassword(userRepo, passwordService);

            // Rejects missing current password
            await assert.rejects(
                () => changePassword.execute("u-3", { newPassword: "newpassword123" } as any),
                (err: any) => err instanceof CurrentPasswordRequiredError
            );

            // Rejects incorrect current password
            await assert.rejects(
                () => changePassword.execute("u-3", { currentPassword: "wrong", newPassword: "newpassword123" }),
                (err: any) => err instanceof InvalidCurrentPasswordError
            );

            // Successfully changes password
            const res = await changePassword.execute("u-3", {
                currentPassword: "oldpass",
                newPassword: "brandnewpassword",
            });
            assert.strictEqual(res.message, "Password updated successfully");

            const user = await userRepo.findById("u-3");
            assert.strictEqual(user?.password, "hashed_brandnewpassword");
        });

        it("BlockUser should prevent blocking admin, toggle status, and revoke tokens", async () => {
            await userRepo.create({
                id: "admin-1",
                name: "System Admin",
                email: "admin@coursity.io",
                role: "ADMIN",
            });

            await userRepo.create({
                id: "student-1",
                name: "Regular Student",
                email: "student@coursity.io",
                role: "STUDENT",
            });

            const blockUser = new BlockUser(userRepo, tokenRepo as any);

            // Attempt to block admin must throw AdminBlockNotAllowedError
            await assert.rejects(
                () => blockUser.execute("admin-1", true),
                (err: any) => err instanceof AdminBlockNotAllowedError
            );

            // Block student
            const res = await blockUser.execute("student-1", true);
            assert.strictEqual(res.user.isBlocked, true);
            assert.strictEqual(res.message, "User has been blocked successfully");
            assert.ok(tokenRepo.deletedTokens.includes("student-1"));

            // Unblock student
            const unblockRes = await blockUser.execute("student-1", false);
            assert.strictEqual(unblockRes.user.isBlocked, false);
            assert.strictEqual(unblockRes.message, "User has been unblocked successfully");
        });

        it("ApproveTeacher should enforce transitions, validate role, update status, and send notification", async () => {
            await userRepo.create({
                id: "teacher-1",
                name: "Professor Xavier",
                email: "xavier@xmen.edu",
                role: "TEACHER",
                profile: {
                    id: "p-t1",
                    userId: "teacher-1",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    teacherProfile: {
                        id: "tp-1",
                        profileId: "p-t1",
                        approvalStatus: "IN_PROGRESS",
                        isApproved: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
            });

            const approveTeacher = new ApproveTeacher(userRepo, emailService as any);

            // Execute verification
            const verifyRes = await approveTeacher.execute({
                userId: "teacher-1",
                approvalStatus: "VERIFIED",
            });

            assert.strictEqual(verifyRes.user.profile?.teacherProfile?.approvalStatus, "VERIFIED");
            assert.strictEqual(verifyRes.user.profile?.teacherProfile?.isApproved, true);
            assert.strictEqual(verifyRes.message, "Instructor has been verified and approved successfully");
            assert.strictEqual(emailService.sentEmails.length, 1);
            assert.strictEqual(emailService.sentEmails[0].to, "xavier@xavier@xmen.edu".length > 0 ? "xavier@xmen.edu" : "");
            assert.strictEqual(emailService.sentEmails[0].status, "VERIFIED");
        });

        it("GetAllUsers & GetAdminAnalytics should delegate to respective repositories", async () => {
            const getAllUsers = new GetAllUsers(userRepo);
            const users = await getAllUsers.execute({ page: 1, limit: 10 });
            assert.ok(users.pagination);

            const getAdminAnalytics = new GetAdminAnalytics(analyticsRepo);
            const analytics = await getAdminAnalytics.execute();
            assert.strictEqual(analytics.stats.totalRevenue, 1000);
        });
    });

    describe("5. Module Factory (createUserModule)", () => {
        it("should construct decoupled module with in-memory dependencies", () => {
            const module = createUserModule({
                userRepository: userRepo,
                adminAnalyticsRepository: analyticsRepo,
                passwordService,
                tokenRepository: tokenRepo as any,
                emailService: emailService as any,
            });

            assert.ok(module.userRepository);
            assert.ok(module.adminAnalyticsRepository);
            assert.ok(module.useCases.getProfile);
            assert.ok(module.useCases.changePassword);
            assert.ok(module.controllers.getProfileController);
            assert.ok(module.router);
        });
    });
});
