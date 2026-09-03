import { Router, RequestHandler } from "express";
import { SignupController } from "../controllers/signup.controller";
import { VerifyOtpController } from "../controllers/verify-otp.controller";
import { ResendOtpController } from "../controllers/resend-otp.controller";
import { SigninController } from "../controllers/signin.controller";
import { LogoutController } from "../controllers/logout.controller";
import { RefreshController } from "../controllers/refresh.controller";
import { ForgotPasswordController } from "../controllers/forgot-password.controller";
import { ResetPasswordController } from "../controllers/reset-password.controller";
import { GoogleAuthController } from "../controllers/google-auth.controller";
import { MeController } from "../controllers/me.controller";
import {
    signupSchema,
    verifySignupSchema,
    resendOtpSchema,
    signinSchema,
    logoutSchema,
    refreshSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    googleAuthSchema,
    googleCallbackSchema,
} from "../validators/index";
import validate from "@/app/middlewares/validate";
import { authRateLimiter } from "@/app/middlewares/rate-limit.middleware";

export class AuthRoutes {
    public readonly router: Router;

    constructor(
        private readonly signupController: SignupController,
        private readonly verifyOtpController: VerifyOtpController,
        private readonly resendOtpController: ResendOtpController,
        private readonly signinController: SigninController,
        private readonly logoutController: LogoutController,
        private readonly refreshController: RefreshController,
        private readonly forgotPasswordController: ForgotPasswordController,
        private readonly resetPasswordController: ResetPasswordController,
        private readonly googleAuthController: GoogleAuthController,
        private readonly meController: MeController,
        private readonly authMiddleware: RequestHandler
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.use(authRateLimiter);

        // Sign up & Email Verification OTP
        this.router.post(
            "/signup",
            validate(signupSchema),
            this.signupController.execute
        );

        this.router.post(
            "/verify-otp",
            validate(verifySignupSchema),
            this.verifyOtpController.execute
        );

        this.router.post(
            "/resend-otp",
            validate(resendOtpSchema),
            this.resendOtpController.execute
        );

        // Sign In & Authentication Session
        this.router.post(
            "/signin",
            validate(signinSchema),
            this.signinController.execute
        );

        this.router.post(
            "/logout",
            validate(logoutSchema),
            this.logoutController.execute
        );

        this.router.post(
            "/refresh",
            validate(refreshSchema),
            this.refreshController.execute
        );

        // Current Authenticated User
        this.router.get(
            "/me",
            this.authMiddleware,
            this.meController.execute
        );

        // Password Recovery
        this.router.post(
            "/forgot-password",
            validate(forgotPasswordSchema),
            this.forgotPasswordController.execute
        );

        this.router.post(
            "/reset-password",
            validate(resetPasswordSchema),
            this.resetPasswordController.execute
        );

        // Google OAuth Routes
        this.router.get(
            "/google",
            this.googleAuthController.getAuthUrl
        );

        this.router.post(
            "/google",
            validate(googleAuthSchema),
            this.googleAuthController.execute
        );

        this.router.get(
            "/google/callback",
            this.googleAuthController.callback
        );

        this.router.post(
            "/google/callback",
            validate(googleCallbackSchema),
            this.googleAuthController.callback
        );
    }
}
