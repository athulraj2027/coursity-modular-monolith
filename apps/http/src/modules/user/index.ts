import { RequestHandler } from "express";

// Repositories & Services
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";
import { PrismaAdminAnalyticsRepository } from "./infrastructure/repositories/prisma-admin-analytics.repository";
import {
    UserRepository,
    IUserRepository,
    IUserQueryRepository,
    IUserMutationRepository,
    IUserAdminRepository,
} from "./domain/repositories/user.repository";
import { IAdminAnalyticsRepository } from "./domain/repositories/admin-analytics.repository";

// Use Cases
import { GetProfile } from "./application/use-cases/get-profile.usecase";
import { UpdateProfile } from "./application/use-cases/update-profile.usecase";
import { ChangePassword } from "./application/use-cases/change-password.usecase";
import { GetAllUsers } from "./application/use-cases/get-all-users.usecase";
import { GetUserById } from "./application/use-cases/get-user-by-id.usecase";
import { BlockUser } from "./application/use-cases/block-user.usecase";
import { ApproveTeacher } from "./application/use-cases/approve-teacher.usecase";
import { GetAdminAnalytics } from "./application/use-cases/get-admin-analytics.usecase";
import { DeleteUser } from "./application/use-cases/delete-user.usecase";

// Controllers
import { GetProfileController } from "./presentation/controllers/get-profile.controller";
import { UpdateProfileController } from "./presentation/controllers/update-profile.controller";
import { ChangePasswordController } from "./presentation/controllers/change-password.controller";
import { GetAllUsersController } from "./presentation/controllers/get-all-users.controller";
import { GetUserByIdController } from "./presentation/controllers/get-user-by-id.controller";
import { BlockUserController } from "./presentation/controllers/block-user.controller";
import { ApproveTeacherController } from "./presentation/controllers/approve-teacher.controller";
import { GetAdminAnalyticsController } from "./presentation/controllers/get-admin-analytics.controller";
import { DeleteUserController } from "./presentation/controllers/delete-user.controller";

// Middlewares & Routes
import { createAuthMiddleware } from "@/app/middlewares/auth.middleware";
import { createIsBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";
import { UserRoutes } from "./presentation/routes/user.routes";

// Shared Infrastructure Services & Repositories
import {
    IPasswordService,
    BcryptPasswordService,
    JwtTokenService,
} from "@/infrastructure/security";
import { TokenRepository } from "@/modules/auth/domain/repositories/token.repository";
import { RedisTokenRepository } from "@/modules/auth/infrastructure/repositories/redis-token.repository";
import { emailService, IEmailService } from "@/infrastructure/email";

export interface UserModuleDependencies {
    userRepository?: UserRepository;
    adminAnalyticsRepository?: IAdminAnalyticsRepository;
    passwordService?: IPasswordService;
    tokenRepository?: TokenRepository;
    emailService?: IEmailService;
    authMiddleware?: RequestHandler;
    isBlockedMiddleware?: RequestHandler;
    adminMiddleware?: RequestHandler;
}

export function createUserModule(deps: UserModuleDependencies = {}) {
    const repo = deps.userRepository ?? new PrismaUserRepository();
    const analyticsRepo = deps.adminAnalyticsRepository ?? new PrismaAdminAnalyticsRepository();
    const passService = deps.passwordService ?? new BcryptPasswordService();
    const tokenRepo = deps.tokenRepository ?? new RedisTokenRepository();
    const mailService = deps.emailService ?? emailService;
    const tokenSvc = new JwtTokenService();

    const authMw = deps.authMiddleware ?? createAuthMiddleware(tokenSvc);
    const isBlockedMw = deps.isBlockedMiddleware ?? createIsBlockedMiddleware(repo, tokenRepo);
    const adminMw = deps.adminMiddleware ?? requireRoles("ADMIN");

    const getProfile = new GetProfile(repo);
    const updateProfile = new UpdateProfile(repo);
    const changePassword = new ChangePassword(repo, passService);
    const getAllUsers = new GetAllUsers(repo);
    const getUserById = new GetUserById(repo);
    const blockUser = new BlockUser(repo, tokenRepo);
    const approveTeacher = new ApproveTeacher(repo, mailService);
    const getAdminAnalytics = new GetAdminAnalytics(analyticsRepo);
    const deleteUser = new DeleteUser(repo);

    const getProfileController = new GetProfileController(getProfile);
    const updateProfileController = new UpdateProfileController(updateProfile);
    const changePasswordController = new ChangePasswordController(changePassword);
    const getAllUsersController = new GetAllUsersController(getAllUsers);
    const getUserByIdController = new GetUserByIdController(getUserById);
    const blockUserController = new BlockUserController(blockUser);
    const approveTeacherController = new ApproveTeacherController(approveTeacher);
    const getAdminAnalyticsController = new GetAdminAnalyticsController(getAdminAnalytics);
    const deleteUserController = new DeleteUserController(deleteUser);

    const routes = new UserRoutes(
        getProfileController,
        updateProfileController,
        changePasswordController,
        getAllUsersController,
        getUserByIdController,
        blockUserController,
        approveTeacherController,
        getAdminAnalyticsController,
        authMw,
        isBlockedMw,
        adminMw,
        deleteUserController
    );

    return {
        userRepository: repo,
        adminAnalyticsRepository: analyticsRepo,
        useCases: {
            getProfile,
            updateProfile,
            changePassword,
            getAllUsers,
            getUserById,
            blockUser,
            approveTeacher,
            getAdminAnalytics,
            deleteUser,
        },
        controllers: {
            getProfileController,
            updateProfileController,
            changePasswordController,
            getAllUsersController,
            getUserByIdController,
            blockUserController,
            approveTeacherController,
            getAdminAnalyticsController,
            deleteUserController,
        },
        routes,
        router: routes.router,
    };
}

// Module default instances
const defaultModule = createUserModule();

export const userRepository = defaultModule.userRepository;
export const userRepo = userRepository;
export const userRouter = defaultModule.router;

// Domain & Presentation Exports
export * from "./domain/entities/user.entity";
export * from "./domain/dtos/create-user.dto";
export * from "./domain/dtos/update-user.dto";
export * from "./domain/dtos/change-password.dto";
export * from "./domain/dtos/user-query.dto";
export * from "./domain/dtos/admin-analytics.dto";
export * from "./domain/repositories/user.repository";
export * from "./domain/repositories/admin-analytics.repository";
export * from "./domain/policies";
export * from "./domain/errors";
export * from "./infrastructure/repositories/prisma-user.repository";
export * from "./infrastructure/repositories/prisma-admin-analytics.repository";
export * from "./presentation/schemas";
export * from "./presentation/validators/user.validator";
export * from "./presentation/controllers";
export * from "./presentation/routes/user.routes";
export * from "./application/use-cases/get-profile.usecase";
export * from "./application/use-cases/update-profile.usecase";
export * from "./application/use-cases/change-password.usecase";
export * from "./application/use-cases/get-all-users.usecase";
export * from "./application/use-cases/get-user-by-id.usecase";
export * from "./application/use-cases/block-user.usecase";
export * from "./application/use-cases/approve-teacher.usecase";
export * from "./application/use-cases/get-admin-analytics.usecase";
export * from "./application/use-cases/delete-user.usecase";

export default userRouter;
