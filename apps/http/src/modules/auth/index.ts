// Repositories & Infrastructure Services
import { PrismaUserRepository } from "@/modules/user";
import { BcryptPasswordService } from "./infrastructure/services/bcrypt/bcrypt-password.service";
import { RedisOtpRepository } from "./infrastructure/repositories/redis-otp.repository";
import { RedisTokenRepository } from "./infrastructure/repositories/redis-token.repository";
import { JwtTokenService } from "./infrastructure/services/jwt/jwt-token.service";
import { GoogleOAuthService } from "./infrastructure/oauth/google-oauth.service";

// Use Cases
import { SignupUser } from "./application/use-cases/signup.user.usecase";
import { VerifySignupOtp } from "./application/use-cases/verify-signup-otp.usecase";
import { ResendSignupOtp } from "./application/use-cases/resend-signup-otp.usecase";
import { SigninUser } from "./application/use-cases/signin.user.usecase";
import { LogoutUser } from "./application/use-cases/logout.user.usecase";
import { RefreshToken } from "./application/use-cases/refresh-token.usecase";
import { ForgotPassword } from "./application/use-cases/forgot-password.usecase";
import { ResetPassword } from "./application/use-cases/reset-password.usecase";
import { GoogleAuth } from "./application/use-cases/google-auth.usecase";
import { GetCurrentUser } from "./application/use-cases/get-current-user.usecase";

// Controllers
import { SignupController } from "./presentation/controllers/signup.controller";
import { VerifyOtpController } from "./presentation/controllers/verify-otp.controller";
import { ResendOtpController } from "./presentation/controllers/resend-otp.controller";
import { SigninController } from "./presentation/controllers/signin.controller";
import { LogoutController } from "./presentation/controllers/logout.controller";
import { RefreshController } from "./presentation/controllers/refresh.controller";
import { ForgotPasswordController } from "./presentation/controllers/forgot-password.controller";
import { ResetPasswordController } from "./presentation/controllers/reset-password.controller";
import { GoogleAuthController } from "./presentation/controllers/google-auth.controller";
import { MeController } from "./presentation/controllers/me.controller";

// Middleware & Routes
import { createAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { createIsBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { AuthRoutes } from "./presentation/routes/auth.routes";

// 1. Repositories & Services
const userRepository = new PrismaUserRepository();
const passwordService = new BcryptPasswordService();
const otpRepository = new RedisOtpRepository();
const tokenRepository = new RedisTokenRepository();
const tokenService = new JwtTokenService();
const oauthService = new GoogleOAuthService();

// 2. Use Cases
const signupUser = new SignupUser(userRepository, passwordService, otpRepository);
const verifySignupOtp = new VerifySignupOtp(
    otpRepository,
    userRepository,
    tokenService,
    tokenRepository
);
const resendSignupOtp = new ResendSignupOtp(otpRepository, userRepository);
const signinUser = new SigninUser(userRepository, passwordService, tokenService, tokenRepository);
const logoutUser = new LogoutUser(tokenRepository, tokenService);
const refreshTokenUseCase = new RefreshToken(tokenService, tokenRepository, userRepository);
const forgotPassword = new ForgotPassword(userRepository, otpRepository);
const resetPassword = new ResetPassword(userRepository, passwordService, otpRepository, tokenRepository);
const googleAuth = new GoogleAuth(oauthService, userRepository, tokenService, tokenRepository);
const getCurrentUser = new GetCurrentUser(userRepository);

// 3. Middlewares & Controllers
const authMiddleware = createAuthMiddleware(tokenService);
const isBlockedMiddleware = createIsBlockedMiddleware(userRepository);
const signupController = new SignupController(signupUser);
const verifyOtpController = new VerifyOtpController(verifySignupOtp);
const resendOtpController = new ResendOtpController(resendSignupOtp);
const signinController = new SigninController(signinUser);
const logoutController = new LogoutController(logoutUser);
const refreshController = new RefreshController(refreshTokenUseCase);
const forgotPasswordController = new ForgotPasswordController(forgotPassword);
const resetPasswordController = new ResetPasswordController(resetPassword);
const googleAuthController = new GoogleAuthController(googleAuth);
const meController = new MeController(getCurrentUser);

// 4. Routes
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

export * from "./application/dtos";
export * from "./presentation/validators";
export const authRouter = authRoutes.router;
export default authRouter;
