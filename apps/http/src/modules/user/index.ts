// Repositories & Services
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { BcryptPasswordService } from "./infrastructure/services/bcrypt-password.service";
import { JwtTokenService } from "@/modules/auth/infrastructure/services/jwt/jwt-token.service";

// Use Cases
import { GetProfile } from "./application/use-cases/get-profile.usecase";
import { UpdateProfile } from "./application/use-cases/update-profile.usecase";
import { ChangePassword } from "./application/use-cases/change-password.usecase";
import { GetAllUsers } from "./application/use-cases/get-all-users.usecase";
import { GetUserById } from "./application/use-cases/get-user-by-id.usecase";
import { BlockUser } from "./application/use-cases/block-user.usecase";

// Controllers
import { GetProfileController } from "./presentation/controllers/get-profile.controller";
import { UpdateProfileController } from "./presentation/controllers/update-profile.controller";
import { ChangePasswordController } from "./presentation/controllers/change-password.controller";
import { GetAllUsersController } from "./presentation/controllers/get-all-users.controller";
import { GetUserByIdController } from "./presentation/controllers/get-user-by-id.controller";
import { BlockUserController } from "./presentation/controllers/block-user.controller";

// Middlewares & Routes
import { createAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { createIsBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import { UserRoutes } from "./presentation/routes/user.routes";

// 1. Repositories & Services
const userRepository = new PrismaUserRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();

// 2. Middlewares
const authMiddleware = createAuthMiddleware(tokenService);
const isBlockedMiddleware = createIsBlockedMiddleware(userRepository);
const adminMiddleware = requireRoles("ADMIN");

// 3. Use Cases
const getProfile = new GetProfile(userRepository);
const updateProfile = new UpdateProfile(userRepository);
const changePassword = new ChangePassword(userRepository, passwordService);
const getAllUsers = new GetAllUsers(userRepository);
const getUserById = new GetUserById(userRepository);
const blockUser = new BlockUser(userRepository);

// 4. Controllers
const getProfileController = new GetProfileController(getProfile);
const updateProfileController = new UpdateProfileController(updateProfile);
const changePasswordController = new ChangePasswordController(changePassword);
const getAllUsersController = new GetAllUsersController(getAllUsers);
const getUserByIdController = new GetUserByIdController(getUserById);
const blockUserController = new BlockUserController(blockUser);

// 5. Routes
const userRoutes = new UserRoutes(
    getProfileController,
    updateProfileController,
    changePasswordController,
    getAllUsersController,
    getUserByIdController,
    blockUserController,
    authMiddleware,
    isBlockedMiddleware,
    adminMiddleware
);

export * from "./domain/entities/user.entity";
export * from "./domain/dtos/create-user.dto";
export * from "./domain/dtos/update-user.dto";
export * from "./domain/dtos/change-password.dto";
export * from "./domain/dtos/user-query.dto";
export * from "./domain/repositories/user.repository";
export * from "./infrastructure/repositories/prisma-user.repository";
export * from "./presentation/validators/user.validator";

export const userRouter = userRoutes.router;
export default userRouter;

