import { Router } from "express";
import { SignupController } from "../controllers/signup.controller";
import { signupSchema } from "../validators/signup.schema";
import validate from "@/shared/middlewares/validate";

export class AuthRoutes {
    public readonly router: Router;

    constructor(
        private readonly signupController: SignupController
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post(
            "/signup",
            validate(signupSchema),
            this.signupController.execute
        );

        this.router.post("/verify-otp", (req, res) => { res.json({ message: "verify-otp" }); });
        this.router.post("/signin", (req, res) => { res.json({ message: "signin" }); });
        this.router.post("/logout", (req, res) => { res.json({ message: "logout" }); });
        this.router.post("/refresh", (req, res) => { res.json({ message: "refresh" }); });
        this.router.post("/forgot-password", (req, res) => { res.json({ message: "forgot-password" }); });
        this.router.post("/reset-password", (req, res) => { res.json({ message: "reset-password" }); });
        this.router.post("/google", (req, res) => { res.json({ message: "google" }); });
        this.router.post("/google/callback", (req, res) => { res.json({ message: "google/callback" }); });
    }
}
