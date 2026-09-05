import { Router, RequestHandler } from "express";
import { GetProfileController } from "../controllers/get-profile.controller";
import { UpdateProfileController } from "../controllers/update-profile.controller";
import { UpdateStudentProfileController } from "../controllers/update-student-profile.controller";
import { UpdateTeacherProfileController } from "../controllers/update-teacher-profile.controller";
import {
    updateProfileSchema,
    updateStudentProfileSchema,
    updateTeacherProfileSchema,
} from "../validators/profile.validator";
import validate from "@/app/middlewares/validate";

export class ProfileRoutes {
    public readonly router: Router;

    constructor(
        private readonly getProfileController: GetProfileController,
        private readonly updateProfileController: UpdateProfileController,
        private readonly updateStudentProfileController: UpdateStudentProfileController,
        private readonly updateTeacherProfileController: UpdateTeacherProfileController,
        private readonly authMiddleware?: RequestHandler,
        private readonly isBlockedMiddleware?: RequestHandler
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        const middlewares: RequestHandler[] = [];
        if (this.authMiddleware) middlewares.push(this.authMiddleware);
        if (this.isBlockedMiddleware) middlewares.push(this.isBlockedMiddleware);

        // --- 1. Generic User Profile (Auto-detects Role) ---
        this.router.get(
            "/",
            ...middlewares,
            this.getProfileController.execute
        );

        this.router.put(
            "/",
            ...middlewares,
            validate(updateProfileSchema),
            this.updateProfileController.execute
        );

        this.router.patch(
            "/",
            ...middlewares,
            validate(updateProfileSchema),
            this.updateProfileController.execute
        );

        // --- 2. Student Profile Endpoints ---
        this.router.get(
            "/student",
            ...middlewares,
            this.getProfileController.execute
        );

        this.router.put(
            "/student",
            ...middlewares,
            validate(updateStudentProfileSchema),
            this.updateStudentProfileController.execute
        );

        this.router.patch(
            "/student",
            ...middlewares,
            validate(updateStudentProfileSchema),
            this.updateStudentProfileController.execute
        );

        // --- 3. Teacher Profile Endpoints ---
        this.router.get(
            "/teacher",
            ...middlewares,
            this.getProfileController.execute
        );

        this.router.put(
            "/teacher",
            ...middlewares,
            validate(updateTeacherProfileSchema),
            this.updateTeacherProfileController.execute
        );

        this.router.patch(
            "/teacher",
            ...middlewares,
            validate(updateTeacherProfileSchema),
            this.updateTeacherProfileController.execute
        );
    }
}
