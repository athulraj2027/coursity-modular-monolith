import { Router, RequestHandler } from "express";
import { GetProfileController } from "../controllers/get-profile.controller";
import { UpdateProfileController } from "../controllers/update-profile.controller";
import { ChangePasswordController } from "../controllers/change-password.controller";
import { GetAllUsersController } from "../controllers/get-all-users.controller";
import { GetUserByIdController } from "../controllers/get-user-by-id.controller";
import { UpdateUserRoleController } from "../controllers/update-user-role.controller";
import { DeleteUserController } from "../controllers/delete-user.controller";
import {
    updateProfileSchema,
    changePasswordSchema,
    updateUserRoleSchema,
} from "../validators/user.validator";
import validate from "@/app/middlewares/validate";

export class UserRoutes {
    public readonly router: Router;

    constructor(
        private readonly getProfileController: GetProfileController,
        private readonly updateProfileController: UpdateProfileController,
        private readonly changePasswordController: ChangePasswordController,
        private readonly getAllUsersController: GetAllUsersController,
        private readonly getUserByIdController: GetUserByIdController,
        private readonly updateUserRoleController: UpdateUserRoleController,
        private readonly deleteUserController: DeleteUserController,
        private readonly authMiddleware: RequestHandler,
        private readonly adminMiddleware: RequestHandler
    ) {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes(): void {
        // --- 1. Current User Profile (Self) ---
        this.router.get(
            "/profile",
            this.authMiddleware,
            this.getProfileController.execute
        );

        this.router.patch(
            "/profile",
            this.authMiddleware,
            validate(updateProfileSchema),
            this.updateProfileController.execute
        );

        this.router.put(
            "/profile",
            this.authMiddleware,
            validate(updateProfileSchema),
            this.updateProfileController.execute
        );

        this.router.post(
            "/change-password",
            this.authMiddleware,
            validate(changePasswordSchema),
            this.changePasswordController.execute
        );

        // --- 2. Admin User Directory & Operations ---
        this.router.get(
            "/",
            this.authMiddleware,
            this.adminMiddleware,
            this.getAllUsersController.execute
        );

        this.router.get(
            "/:id",
            this.authMiddleware,
            this.adminMiddleware,
            this.getUserByIdController.execute
        );

        this.router.patch(
            "/:id/role",
            this.authMiddleware,
            this.adminMiddleware,
            validate(updateUserRoleSchema),
            this.updateUserRoleController.execute
        );

        this.router.put(
            "/:id/role",
            this.authMiddleware,
            this.adminMiddleware,
            validate(updateUserRoleSchema),
            this.updateUserRoleController.execute
        );

        this.router.delete(
            "/:id",
            this.authMiddleware,
            this.adminMiddleware,
            this.deleteUserController.execute
        );
    }
}
