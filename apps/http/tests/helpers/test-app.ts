import express from "express";
import { AuthRoutes } from "../../src/modules/auth/presentation/routes/auth.routes";
import { SignupUser } from "../../src/modules/auth/application/use-cases/signup.user.usecase";
import { VerifySignupOtp } from "../../src/modules/auth/application/use-cases/verify-signup-otp.usecase";
import { ResendSignupOtp } from "../../src/modules/auth/application/use-cases/resend-signup-otp.usecase";
import { SigninUser } from "../../src/modules/auth/application/use-cases/signin.user.usecase";
import { LogoutUser } from "../../src/modules/auth/application/use-cases/logout.user.usecase";
import { RefreshToken } from "../../src/modules/auth/application/use-cases/refresh-token.usecase";
import { ForgotPassword } from "../../src/modules/auth/application/use-cases/forgot-password.usecase";
import { ResetPassword } from "../../src/modules/auth/application/use-cases/reset-password.usecase";
import { GoogleAuth } from "../../src/modules/auth/application/use-cases/google-auth.usecase";
import { GetCurrentUser } from "../../src/modules/auth/application/use-cases/get-current-user.usecase";
import { SignupController } from "../../src/modules/auth/presentation/controllers/signup.controller";
import { VerifyOtpController } from "../../src/modules/auth/presentation/controllers/verify-otp.controller";
import { ResendOtpController } from "../../src/modules/auth/presentation/controllers/resend-otp.controller";
import { SigninController } from "../../src/modules/auth/presentation/controllers/signin.controller";
import { LogoutController } from "../../src/modules/auth/presentation/controllers/logout.controller";
import { RefreshController } from "../../src/modules/auth/presentation/controllers/refresh.controller";
import { ForgotPasswordController } from "../../src/modules/auth/presentation/controllers/forgot-password.controller";
import { ResetPasswordController } from "../../src/modules/auth/presentation/controllers/reset-password.controller";
import { GoogleAuthController } from "../../src/modules/auth/presentation/controllers/google-auth.controller";
import { MeController } from "../../src/modules/auth/presentation/controllers/me.controller";
import { BcryptPasswordService } from "../../src/modules/auth/infrastructure/services/bcrypt/bcrypt-password.service";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/services/jwt/jwt-token.service";
import { createAuthMiddleware } from "../../src/app/middlewares/auth.middleware";
import { createIsBlockedMiddleware } from "../../src/app/middlewares/is-blocked.middleware";
import { requireRoles } from "../../src/app/middlewares/role.middleware";
import errorMiddleware from "../../src/app/middlewares/err.middleware";
import notFoundMiddleware from "../../src/app/middlewares/not-found.middleware";
import { createIdempotencyMiddleware } from "../../src/app/middlewares/idempotency.middleware";
import { IdempotencyService, InMemoryIdempotencyService } from "../../src/infrastructure/idempotency/idempotency.service";
import {
    User,
    UserRepository,
    CreateUserData,
    FindUsersOptions,
    PaginatedUsersResult,
} from "../../src/modules/user";
import {
    GetProfile,
    UpdateProfile,
    ChangePassword,
    GetAllUsers,
    GetUserById,
    BlockUser,
    ApproveTeacher,
} from "../../src/modules/user/application/use-cases";
import {
    GetProfileController,
    UpdateProfileController,
    ChangePasswordController,
    GetAllUsersController,
    GetUserByIdController,
    BlockUserController,
    ApproveTeacherController,
} from "../../src/modules/user/presentation/controllers";
import { UserRoutes } from "../../src/modules/user/presentation/routes/user.routes";
import { OtpRepository, StoredOtpData, StoredResetPasswordOtpData, TempSignupUser } from "../../src/modules/auth/domain/repositories/redis-otp.repository";
import { TokenRepository } from "../../src/modules/auth/domain/repositories/token.repository";
import { OAuthService, OAuthUserProfile } from "../../src/modules/auth/domain/services/oauth.service";
import {
    ProfileRepository,
    FullUserProfile,
    UserProfile,
    TeacherProfile,
    GetProfile as GetFullProfile,
    UpdateProfile as UpdateFullProfile,
    UpdateStudentProfile,
    UpdateTeacherProfile,
    SubmitTeacherVerification,
    GetProfileController as GetFullProfileController,
    UpdateProfileController as UpdateFullProfileController,
    UpdateStudentProfileController,
    UpdateTeacherProfileController,
    SubmitTeacherVerificationController,
    ProfileRoutes,
} from "../../src/modules/profile";

export class InMemoryProfileRepository implements ProfileRepository {
    public profiles = new Map<string, UserProfile>();
    public teacherProfiles = new Map<string, TeacherProfile>();

    constructor(private readonly userRepo: InMemoryUserRepository) { }

    async getFullProfileByUserId(userId: string): Promise<FullUserProfile | null> {
        const user = await this.userRepo.findById(userId);
        if (!user) return null;

        let profile = this.profiles.get(userId) || null;
        if (!profile && user.profile) {
            profile = {
                id: user.profile.id,
                userId: user.id,
                avatar: user.profile.avatar,
                bio: user.profile.bio,
                phone: user.profile.phone,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
            this.profiles.set(userId, profile);
        }

        let teacherProfile = profile ? (this.teacherProfiles.get(profile.id) || null) : null;
        if (!teacherProfile && user.profile?.teacherProfile) {
            teacherProfile = {
                id: user.profile.teacherProfile.id,
                profileId: user.profile.id,
                expertise: user.profile.teacherProfile.expertise,
                qualifications: user.profile.teacherProfile.qualifications,
                experienceYears: user.profile.teacherProfile.experienceYears,
                linkedinUrl: user.profile.teacherProfile.linkedinUrl,
                twitterUrl: user.profile.teacherProfile.twitterUrl,
                websiteUrl: user.profile.teacherProfile.websiteUrl,
                isApproved: user.profile.teacherProfile.isApproved,
                approvalStatus: user.profile.teacherProfile.approvalStatus,
                submissionCount: user.profile.teacherProfile.submissionCount || 0,
                rejectionReason: user.profile.teacherProfile.rejectionReason,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
            this.teacherProfiles.set(user.profile.id, teacherProfile);
        }

        const { password, ...safeUser } = user;
        return {
            ...safeUser,
            profile,
            teacherProfile,
        };
    }

    async getProfileByUserId(userId: string): Promise<UserProfile | null> {
        let profile = this.profiles.get(userId) || null;
        if (!profile) {
            const user = this.userRepo.users.get(userId);
            if (user?.profile) {
                profile = {
                    id: user.profile.id,
                    userId: user.id,
                    avatar: user.profile.avatar,
                    bio: user.profile.bio,
                    phone: user.profile.phone,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                };
                this.profiles.set(userId, profile);
            }
        }
        return profile;
    }

    async getTeacherProfileByProfileId(profileId: string): Promise<TeacherProfile | null> {
        let tp = this.teacherProfiles.get(profileId) || null;
        if (!tp) {
            for (const user of this.userRepo.users.values()) {
                if (user.profile && (user.profile.id === profileId || user.id === profileId) && user.profile.teacherProfile) {
                    tp = {
                        id: user.profile.teacherProfile.id,
                        profileId: user.profile.id,
                        expertise: user.profile.teacherProfile.expertise,
                        qualifications: user.profile.teacherProfile.qualifications,
                        experienceYears: user.profile.teacherProfile.experienceYears,
                        linkedinUrl: user.profile.teacherProfile.linkedinUrl,
                        twitterUrl: user.profile.teacherProfile.twitterUrl,
                        websiteUrl: user.profile.teacherProfile.websiteUrl,
                        isApproved: user.profile.teacherProfile.isApproved,
                        approvalStatus: user.profile.teacherProfile.approvalStatus,
                        submissionCount: user.profile.teacherProfile.submissionCount || 0,
                        rejectionReason: user.profile.teacherProfile.rejectionReason,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    };
                    this.teacherProfiles.set(profileId, tp);
                    break;
                }
            }
        }
        return tp;
    }

    async upsertProfile(
        userId: string,
        data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<UserProfile> {
        const existing = this.profiles.get(userId);
        const profile: UserProfile = {
            id: existing?.id || `prof_${userId}`,
            userId,
            avatar: data.avatar !== undefined ? data.avatar : (existing?.avatar ?? null),
            bio: data.bio !== undefined ? data.bio : (existing?.bio ?? null),
            phone: data.phone !== undefined ? data.phone : (existing?.phone ?? null),
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        this.profiles.set(userId, profile);

        const user = this.userRepo.users.get(userId);
        if (user) {
            user.profile = {
                id: profile.id,
                avatar: profile.avatar,
                bio: profile.bio,
                phone: profile.phone,
                teacherProfile: user.profile?.teacherProfile || null,
            };
        }
        return profile;
    }

    async upsertTeacherProfile(
        profileId: string,
        data: Partial<Omit<TeacherProfile, "id" | "profileId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile> {
        const existing = this.teacherProfiles.get(profileId);
        const profile: TeacherProfile = {
            id: existing?.id || `tp_${profileId}`,
            profileId,
            expertise: data.expertise !== undefined ? data.expertise : (existing?.expertise ?? []),
            qualifications: data.qualifications !== undefined ? data.qualifications : (existing?.qualifications ?? null),
            experienceYears: data.experienceYears !== undefined ? data.experienceYears : (existing?.experienceYears ?? null),
            linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : (existing?.linkedinUrl ?? null),
            twitterUrl: data.twitterUrl !== undefined ? data.twitterUrl : (existing?.twitterUrl ?? null),
            websiteUrl: data.websiteUrl !== undefined ? data.websiteUrl : (existing?.websiteUrl ?? null),
            isApproved: data.isApproved !== undefined ? data.isApproved : (existing?.isApproved ?? false),
            approvalStatus: data.approvalStatus !== undefined ? data.approvalStatus : (existing?.approvalStatus ?? "PENDING"),
            submissionCount: data.submissionCount !== undefined ? data.submissionCount : (existing?.submissionCount ?? 0),
            rejectionReason: data.rejectionReason !== undefined ? data.rejectionReason : (existing?.rejectionReason ?? null),
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        this.teacherProfiles.set(profileId, profile);

        for (const user of this.userRepo.users.values()) {
            if (user.profile && (user.profile.id === profileId || user.id === profileId)) {
                user.profile.teacherProfile = {
                    id: profile.id,
                    expertise: profile.expertise,
                    qualifications: profile.qualifications,
                    experienceYears: profile.experienceYears,
                    linkedinUrl: profile.linkedinUrl,
                    twitterUrl: profile.twitterUrl,
                    websiteUrl: profile.websiteUrl,
                    isApproved: profile.isApproved,
                    approvalStatus: profile.approvalStatus,
                    submissionCount: profile.submissionCount,
                    rejectionReason: profile.rejectionReason,
                };
                break;
            }
        }
        return profile;
    }

    async updateUserName(userId: string, name: string): Promise<void> {
        await this.userRepo.update(userId, { name });
    }
}

export class InMemoryUserRepository implements UserRepository {
    public users = new Map<string, User>();
    public profileRepo?: InMemoryProfileRepository;

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalized = email.toLowerCase().trim();
        for (const user of this.users.values()) {
            if (user.email.toLowerCase().trim() === normalized) {
                return user;
            }
        }
        return null;
    }

    async create(data: CreateUserData): Promise<User> {
        const id = `usr_${Math.random().toString(36).substring(2, 9)}`;
        const user: User = {
            id,
            name: data.name,
            email: data.email.toLowerCase().trim(),
            password: data.password,
            role: data.role,
            authProvider: data.authProvider,
            profile: data.role === "TEACHER" ? {
                id: `prof_${id}`,
                avatar: null,
                bio: null,
                phone: null,
                teacherProfile: {
                    id: `tp_${id}`,
                    expertise: [],
                    qualifications: null,
                    experienceYears: null,
                    linkedinUrl: null,
                    twitterUrl: null,
                    websiteUrl: null,
                    isApproved: false,
                    approvalStatus: "PENDING",
                    submissionCount: 0,
                    rejectionReason: null,
                }
            } : (data.role === "STUDENT" ? {
                id: `prof_${id}`,
                avatar: null,
                bio: null,
                phone: null,
                teacherProfile: null,
            } : null),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(id, user);
        return user;
    }

    async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
        const existing = this.users.get(id);
        if (!existing) {
            throw new Error(`User with id ${id} not found`);
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

    async updateTeacherApproval(
        userId: string,
        data:
            | {
                  approvalStatus?: ApprovalStatus;
                  isApproved?: boolean;
                  rejectionReason?: string | null;
              }
            | boolean
    ): Promise<User> {
        const existing = this.users.get(userId);
        if (!existing) {
            throw new Error(`User with id ${userId} not found`);
        }

        let approvalStatus: ApprovalStatus;
        let isApproved: boolean;
        let rejectionReason: string | null = null;

        if (typeof data === "boolean") {
            isApproved = data;
            approvalStatus = isApproved ? "VERIFIED" : "REVOKED";
        } else {
            approvalStatus = data.approvalStatus || (data.isApproved !== undefined ? (data.isApproved ? "VERIFIED" : "REVOKED") : "PENDING");
            isApproved = data.isApproved !== undefined ? data.isApproved : (approvalStatus === "VERIFIED");
            rejectionReason = data.rejectionReason ?? null;
        }

        const currentProfile = existing.profile || {
            id: `prof_${userId}`,
            avatar: null,
            bio: null,
            phone: null,
            teacherProfile: null,
        };
        const currentTeacherProfile = currentProfile.teacherProfile || {
            id: `tp_${userId}`,
            expertise: [],
            qualifications: null,
            experienceYears: null,
            linkedinUrl: null,
            twitterUrl: null,
            websiteUrl: null,
            isApproved: false,
            rejectionReason: null,
            submissionCount: 0,
        };
        const isVerified = approvalStatus === "VERIFIED";
        const nextSubmissionCount = isVerified
            ? 0
            : (currentTeacherProfile.submissionCount ?? 0);

        const updated: User = {
            ...existing,
            profile: {
                ...currentProfile,
                teacherProfile: {
                    ...currentTeacherProfile,
                    isApproved,
                    approvalStatus,
                    rejectionReason,
                    submissionCount: nextSubmissionCount,
                },
            },
            updatedAt: new Date(),
        };
        this.users.set(userId, updated);

        if (this.profileRepo) {
            const profileId = updated.profile?.id || `prof_${userId}`;
            const existingTp = this.profileRepo.teacherProfiles.get(profileId);
            if (existingTp) {
                existingTp.approvalStatus = approvalStatus;
                existingTp.isApproved = isApproved;
                existingTp.rejectionReason = rejectionReason;
                if (isVerified) {
                    existingTp.submissionCount = 0;
                }
            }
        }

        return updated;
    }

    async findMany(options: FindUsersOptions = {}): Promise<PaginatedUsersResult> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(100, options.limit || 10));

        let list = Array.from(this.users.values());

        if (options.role) {
            list = list.filter((u) => u.role === options.role);
        }

        if (options.authProvider) {
            list = list.filter((u) => u.authProvider === options.authProvider);
        }

        if (options.isBlocked !== undefined) {
            list = list.filter((u) => u.isBlocked === options.isBlocked);
        }

        if (options.approvalStatus !== undefined) {
            list = list.filter((u) => {
                const status = u.profile?.teacherProfile?.approvalStatus || (u.role === "TEACHER" ? "PENDING" : undefined);
                return status === options.approvalStatus;
            });
        }

        if (options.isApproved !== undefined) {
            list = list.filter((u) => {
                if (u.role !== "TEACHER") return false;
                const isApp = u.profile?.teacherProfile?.isApproved ?? (u.profile?.teacherProfile?.approvalStatus === "VERIFIED");
                return Boolean(isApp) === options.isApproved;
            });
        }

        if (options.search && options.search.trim() !== "") {
            const search = options.search.toLowerCase().trim();
            list = list.filter(
                (u) =>
                    u.name.toLowerCase().includes(search) ||
                    u.email.toLowerCase().includes(search)
            );
        }

        const total = list.length;
        const skip = (page - 1) * limit;
        const paged = list.slice(skip, skip + limit).map((u) => {
            const { password, ...safeUser } = u;
            return safeUser;
        });

        return {
            users: paged,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    async count(where?: any): Promise<number> {
        return this.users.size;
    }
}

export class InMemoryOtpRepository implements OtpRepository {
    public signupOtps = new Map<string, StoredOtpData>();
    public resetOtps = new Map<string, StoredResetPasswordOtpData>();

    async saveSignupOtp(email: string, otp: string, userData: TempSignupUser): Promise<void> {
        this.signupOtps.set(email.toLowerCase().trim(), {
            otp,
            userData,
            createdAt: Date.now(),
        });
    }

    async getSignupOtp(email: string): Promise<StoredOtpData | null> {
        return this.signupOtps.get(email.toLowerCase().trim()) || null;
    }

    async deleteSignupOtp(email: string): Promise<void> {
        this.signupOtps.delete(email.toLowerCase().trim());
    }

    async saveResetPasswordOtp(email: string, otp: string): Promise<void> {
        this.resetOtps.set(email.toLowerCase().trim(), {
            otp,
            email: email.toLowerCase().trim(),
            createdAt: Date.now(),
        });
    }

    async getResetPasswordOtp(email: string): Promise<StoredResetPasswordOtpData | null> {
        return this.resetOtps.get(email.toLowerCase().trim()) || null;
    }

    async deleteResetPasswordOtp(email: string): Promise<void> {
        this.resetOtps.delete(email.toLowerCase().trim());
    }
}

export class InMemoryTokenRepository implements TokenRepository {
    public tokens = new Map<string, string>();

    async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
        this.tokens.set(userId, refreshToken);
    }

    async getRefreshToken(userId: string): Promise<string | null> {
        return this.tokens.get(userId) || null;
    }

    async deleteRefreshToken(userId: string): Promise<void> {
        this.tokens.delete(userId);
    }
}

export class MockOAuthService implements OAuthService {
    getAuthorizationUrl(state?: string): string {
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock_id&response_type=code&scope=openid%20email%20profile&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fgoogle%2Fcallback${state ? `&state=${state}` : ""}`;
    }

    async verifyIdToken(idToken: string): Promise<OAuthUserProfile> {
        if (idToken === "invalid_id_token") {
            throw new Error("Invalid Google ID token");
        }
        return {
            id: "google_123456",
            email: "google.user@example.com",
            name: "Google User",
            picture: "https://example.com/avatar.jpg",
            emailVerified: true,
        };
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthUserProfile> {
        if (code === "invalid_code") {
            throw new Error("Invalid authorization code");
        }
        return {
            id: "google_789012",
            email: "oauth.callback@example.com",
            name: "OAuth Callback User",
            picture: "https://example.com/avatar2.jpg",
            emailVerified: true,
        };
    }
}

export interface CreateTestAppOptions {
    userRepo?: InMemoryUserRepository;
    otpRepo?: InMemoryOtpRepository;
    tokenRepo?: InMemoryTokenRepository;
    oauthService?: OAuthService;
    idempotencyService?: IdempotencyService;
}

export function createTestApp(options: CreateTestAppOptions = {}) {
    const userRepo = options.userRepo || new InMemoryUserRepository();
    const otpRepo = options.otpRepo || new InMemoryOtpRepository();
    const tokenRepo = options.tokenRepo || new InMemoryTokenRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JwtTokenService();
    const oauthService = options.oauthService || new MockOAuthService();
    const idempotencyService = options.idempotencyService || new InMemoryIdempotencyService();

    // Middlewares
    const authMiddleware = createAuthMiddleware(tokenService);
    const isBlockedMiddleware = createIsBlockedMiddleware(userRepo, tokenRepo);
    const adminMiddleware = requireRoles("ADMIN");
    const idempotencyMiddleware = createIdempotencyMiddleware(idempotencyService);

    // Auth Use cases
    const signupUser = new SignupUser(userRepo, passwordService, otpRepo);
    const verifySignupOtp = new VerifySignupOtp(otpRepo, userRepo, tokenService, tokenRepo);
    const resendSignupOtp = new ResendSignupOtp(otpRepo, userRepo);
    const signinUser = new SigninUser(userRepo, passwordService, tokenService, tokenRepo);
    const logoutUser = new LogoutUser(tokenRepo, tokenService);
    const refreshToken = new RefreshToken(tokenService, tokenRepo, userRepo);
    const forgotPassword = new ForgotPassword(userRepo, otpRepo);
    const resetPassword = new ResetPassword(userRepo, passwordService, otpRepo, tokenRepo);
    const googleAuth = new GoogleAuth(oauthService, userRepo, tokenService, tokenRepo);
    const getCurrentUser = new GetCurrentUser(userRepo);

    // Auth Controllers
    const signupController = new SignupController(signupUser);
    const verifyOtpController = new VerifyOtpController(verifySignupOtp);
    const resendOtpController = new ResendOtpController(resendSignupOtp);
    const signinController = new SigninController(signinUser);
    const logoutController = new LogoutController(logoutUser);
    const refreshController = new RefreshController(refreshToken);
    const forgotPasswordController = new ForgotPasswordController(forgotPassword);
    const resetPasswordController = new ResetPasswordController(resetPassword);
    const googleAuthController = new GoogleAuthController(googleAuth);
    const meController = new MeController(getCurrentUser);

    // Auth Routes
    const authRoutes = new AuthRoutes(
        signupController,
        verifyOtpController,
        resendOtpController,
        signinController,
        logoutController,
        refreshController,
        forgotPasswordController,
        resetPasswordController,
        googleAuthController,
        meController,
        authMiddleware,
        isBlockedMiddleware
    );

    // User Use Cases
    const getProfile = new GetProfile(userRepo);
    const updateProfile = new UpdateProfile(userRepo);
    const changePassword = new ChangePassword(userRepo, passwordService);
    const getAllUsers = new GetAllUsers(userRepo);
    const getUserById = new GetUserById(userRepo);
    const blockUser = new BlockUser(userRepo, tokenRepo);
    const approveTeacher = new ApproveTeacher(userRepo);

    // User Controllers
    const getProfileController = new GetProfileController(getProfile);
    const updateProfileController = new UpdateProfileController(updateProfile);
    const changePasswordController = new ChangePasswordController(changePassword);
    const getAllUsersController = new GetAllUsersController(getAllUsers);
    const getUserByIdController = new GetUserByIdController(getUserById);
    const blockUserController = new BlockUserController(blockUser);
    const approveTeacherController = new ApproveTeacherController(approveTeacher);

    // User Routes
    const userRoutes = new UserRoutes(
        getProfileController,
        updateProfileController,
        changePasswordController,
        getAllUsersController,
        getUserByIdController,
        blockUserController,
        approveTeacherController,
        authMiddleware,
        isBlockedMiddleware,
        adminMiddleware
    );

    // Profile Setup
    const profileRepo = new InMemoryProfileRepository(userRepo);
    userRepo.profileRepo = profileRepo;
    const getFullProfile = new GetFullProfile(profileRepo);
    const updateFullProfile = new UpdateFullProfile(profileRepo);
    const updateStudentProfile = new UpdateStudentProfile(profileRepo);
    const updateTeacherProfile = new UpdateTeacherProfile(profileRepo);
    const submitTeacherVerification = new SubmitTeacherVerification(profileRepo);

    const getFullProfileController = new GetFullProfileController(getFullProfile);
    const updateFullProfileController = new UpdateFullProfileController(updateFullProfile);
    const updateStudentProfileController = new UpdateStudentProfileController(updateStudentProfile);
    const updateTeacherProfileController = new UpdateTeacherProfileController(updateTeacherProfile);
    const submitTeacherVerificationController = new SubmitTeacherVerificationController(submitTeacherVerification);

    const profileRoutes = new ProfileRoutes(
        getFullProfileController,
        updateFullProfileController,
        updateStudentProfileController,
        updateTeacherProfileController,
        submitTeacherVerificationController,
        authMiddleware,
        isBlockedMiddleware
    );

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(idempotencyMiddleware);
    app.use("/api/auth", authRoutes.router);
    app.use(authMiddleware);
    app.use(isBlockedMiddleware);
    app.use("/api/users", userRoutes.router);
    app.use("/api/profile", profileRoutes.router);
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return {
        app,
        userRepo,
        profileRepo,
        otpRepo,
        tokenRepo,
        passwordService,
        tokenService,
        oauthService,
        idempotencyService,
    };
}

