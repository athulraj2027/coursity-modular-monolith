import { Router } from "express";
import { SignupController } from "../controllers/signup.controller";
import { VerifyOtpController } from "../controllers/verify-otp.controller";
import { ResendOtpController } from "../controllers/resend-otp.controller";
import { signupSchema, verifySignupSchema, resendOtpSchema } from "../validators/index";
import validate from "@/app/middlewares/validate";
import { authRateLimiter } from "@/app/middlewares/rate-limit.middleware";

export class AuthRoutes {
    public readonly router: Router;

    constructor(
        private readonly signupController: SignupController,
        private readonly verifyOtpController: VerifyOtpController,
        private readonly resendOtpController: ResendOtpController
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.use(authRateLimiter);

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

        this.router.post("/signin", (req, res) => { res.json({ message: "signin" }); });
        this.router.post("/logout", (req, res) => { res.json({ message: "logout" }); });
        this.router.post("/refresh", (req, res) => { res.json({ message: "refresh" }); });
        this.router.post("/forgot-password", (req, res) => { res.json({ message: "forgot-password" }); });
        this.router.post("/reset-password", (req, res) => { res.json({ message: "reset-password" }); });
        this.router.post("/google", (req, res) => { res.json({ message: "google" }); });
        this.router.post("/google/callback", (req, res) => { res.json({ message: "google/callback" }); });
    }
}
