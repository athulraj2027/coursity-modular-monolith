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
import { SignupController } from "../../src/modules/auth/presentation/controllers/signup.controller";
import { VerifyOtpController } from "../../src/modules/auth/presentation/controllers/verify-otp.controller";
import { ResendOtpController } from "../../src/modules/auth/presentation/controllers/resend-otp.controller";
import { SigninController } from "../../src/modules/auth/presentation/controllers/signin.controller";
import { LogoutController } from "../../src/modules/auth/presentation/controllers/logout.controller";
import { RefreshController } from "../../src/modules/auth/presentation/controllers/refresh.controller";
import { ForgotPasswordController } from "../../src/modules/auth/presentation/controllers/forgot-password.controller";
import { ResetPasswordController } from "../../src/modules/auth/presentation/controllers/reset-password.controller";
import { GoogleAuthController } from "../../src/modules/auth/presentation/controllers/google-auth.controller";
import { BcryptPasswordService } from "../../src/modules/auth/infrastructure/services/bcrypt/bcrypt-password.service";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/services/jwt/jwt-token.service";
import errorMiddleware from "../../src/app/middlewares/err.middleware";
import notFoundMiddleware from "../../src/app/middlewares/not-found.middleware";
import { User, UserRepository, CreateUserData } from "../../src/modules/user";
import { OtpRepository, StoredOtpData, StoredResetPasswordOtpData, TempSignupUser } from "../../src/modules/auth/domain/repositories/redis-otp.repository";
import { TokenRepository } from "../../src/modules/auth/domain/repositories/token.repository";
import { OAuthService, OAuthUserProfile } from "../../src/modules/auth/domain/services/oauth.service";

export class InMemoryUserRepository implements UserRepository {
    public users = new Map<string, User>();

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
}

export function createTestApp(options: CreateTestAppOptions = {}) {
    const userRepo = options.userRepo || new InMemoryUserRepository();
    const otpRepo = options.otpRepo || new InMemoryOtpRepository();
    const tokenRepo = options.tokenRepo || new InMemoryTokenRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JwtTokenService();
    const oauthService = options.oauthService || new MockOAuthService();

    // Use cases
    const signupUser = new SignupUser(userRepo, passwordService, otpRepo);
    const verifySignupOtp = new VerifySignupOtp(otpRepo, userRepo);
    const resendSignupOtp = new ResendSignupOtp(otpRepo, userRepo);
    const signinUser = new SigninUser(userRepo, passwordService, tokenService, tokenRepo);
    const logoutUser = new LogoutUser(tokenRepo, tokenService);
    const refreshToken = new RefreshToken(tokenService, tokenRepo, userRepo);
    const forgotPassword = new ForgotPassword(userRepo, otpRepo);
    const resetPassword = new ResetPassword(userRepo, passwordService, otpRepo, tokenRepo);
    const googleAuth = new GoogleAuth(oauthService, userRepo, tokenService, tokenRepo);

    // Controllers
    const signupController = new SignupController(signupUser);
    const verifyOtpController = new VerifyOtpController(verifySignupOtp);
    const resendOtpController = new ResendOtpController(resendSignupOtp);
    const signinController = new SigninController(signinUser);
    const logoutController = new LogoutController(logoutUser);
    const refreshController = new RefreshController(refreshToken);
    const forgotPasswordController = new ForgotPasswordController(forgotPassword);
    const resetPasswordController = new ResetPasswordController(resetPassword);
    const googleAuthController = new GoogleAuthController(googleAuth);

    // Routes
    const authRoutes = new AuthRoutes(
        signupController,
        verifyOtpController,
        resendOtpController,
        signinController,
        logoutController,
        refreshController,
        forgotPasswordController,
        resetPasswordController,
        googleAuthController
    );

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api/auth", authRoutes.router);
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return {
        app,
        userRepo,
        otpRepo,
        tokenRepo,
        passwordService,
        tokenService,
        oauthService,
    };
}
