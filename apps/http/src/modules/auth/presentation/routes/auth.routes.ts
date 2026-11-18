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

export interface AuthRoutesDependencies {
    signupController: SignupController;
    verifyOtpController: VerifyOtpController;
    resendOtpController: ResendOtpController;
    signinController: SigninController;
    logoutController: LogoutController;
    refreshController: RefreshController;
    forgotPasswordController: ForgotPasswordController;
    resetPasswordController: ResetPasswordController;
    googleAuthController: GoogleAuthController;
    meController: MeController;
    authMiddleware: RequestHandler;
    isBlockedMiddleware: RequestHandler;
}

export class AuthRoutes {
    public readonly router: Router;
    private readonly signupController: SignupController;
    private readonly verifyOtpController: VerifyOtpController;
    private readonly resendOtpController: ResendOtpController;
    private readonly signinController: SigninController;
    private readonly logoutController: LogoutController;
    private readonly refreshController: RefreshController;
    private readonly forgotPasswordController: ForgotPasswordController;
    private readonly resetPasswordController: ResetPasswordController;
    private readonly googleAuthController: GoogleAuthController;
    private readonly meController: MeController;
    private readonly authMiddleware: RequestHandler;
    private readonly isBlockedMiddleware: RequestHandler;

    constructor(
        dependenciesOrSignup: AuthRoutesDependencies | SignupController,
        verifyOtpController?: VerifyOtpController,
        resendOtpController?: ResendOtpController,
        signinController?: SigninController,
        logoutController?: LogoutController,
        refreshController?: RefreshController,
        forgotPasswordController?: ForgotPasswordController,
        resetPasswordController?: ResetPasswordController,
        googleAuthController?: GoogleAuthController,
        meController?: MeController,
        authMiddleware?: RequestHandler,
        isBlockedMiddleware?: RequestHandler
    ) {
        if (
            dependenciesOrSignup &&
            typeof dependenciesOrSignup === "object" &&
            "signupController" in dependenciesOrSignup
        ) {
            const deps = dependenciesOrSignup as AuthRoutesDependencies;
            this.signupController = deps.signupController;
            this.verifyOtpController = deps.verifyOtpController;
            this.resendOtpController = deps.resendOtpController;
            this.signinController = deps.signinController;
            this.logoutController = deps.logoutController;
            this.refreshController = deps.refreshController;
            this.forgotPasswordController = deps.forgotPasswordController;
            this.resetPasswordController = deps.resetPasswordController;
            this.googleAuthController = deps.googleAuthController;
            this.meController = deps.meController;
            this.authMiddleware = deps.authMiddleware;
            this.isBlockedMiddleware = deps.isBlockedMiddleware;
        } else {
            this.signupController = dependenciesOrSignup as SignupController;
            this.verifyOtpController = verifyOtpController!;
            this.resendOtpController = resendOtpController!;
            this.signinController = signinController!;
            this.logoutController = logoutController!;
            this.refreshController = refreshController!;
            this.forgotPasswordController = forgotPasswordController!;
            this.resetPasswordController = resetPasswordController!;
            this.googleAuthController = googleAuthController!;
            this.meController = meController!;
            this.authMiddleware = authMiddleware!;
            this.isBlockedMiddleware = isBlockedMiddleware!;
        }

        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        // 1. Registration & OTP flow
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

        // 2. Sign In & Session flow
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

        // 3. Password Recovery flow
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

        // 4. Google OAuth flow
        this.router.get(
            "/google/url",
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

        // 5. Authenticated Profile / Me
        this.router.get(
            "/me",
            this.authMiddleware,
            this.isBlockedMiddleware,
            this.meController.execute
        );
    }
}
