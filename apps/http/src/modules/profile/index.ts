import { RequestHandler } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { emailService as defaultEmailService, IEmailService } from "@/infrastructure/email";
import { BcryptPasswordService, IPasswordService } from "@/infrastructure/security";
import { PrismaUserRepository } from "@/modules/user/infrastructure/repositories/prisma-user.repository";

// Repositories & Services
import { PrismaProfileRepository } from "./infrastructure/repositories/prisma-profile.repository";
import {
    IProfileRepository,
    IProfileQueryRepository,
    IProfileMutationRepository,
    ITeacherProfileMutationRepository,
    IUserPasswordRepository,
    ProfileRepository,
} from "./domain/repositories/profile.repository";

// Use Cases
import { GetProfile } from "./application/use-cases/get-profile.usecase";
import { UpdateProfile } from "./application/use-cases/update-profile.usecase";
import { UpdateStudentProfile } from "./application/use-cases/update-student-profile.usecase";
import { UpdateTeacherProfile } from "./application/use-cases/update-teacher-profile.usecase";
import { SubmitTeacherVerification } from "./application/use-cases/submit-teacher-verification.usecase";
import { ChangePassword } from "./application/use-cases/change-password.usecase";

// Controllers
import { GetProfileController } from "./presentation/controllers/get-profile.controller";
import { UpdateProfileController } from "./presentation/controllers/update-profile.controller";
import { UpdateStudentProfileController } from "./presentation/controllers/update-student-profile.controller";
import { UpdateTeacherProfileController } from "./presentation/controllers/update-teacher-profile.controller";
import { SubmitTeacherVerificationController } from "./presentation/controllers/submit-teacher-verification.controller";
import { ChangePasswordController } from "./presentation/controllers/change-password.controller";

// Routes
import { ProfileRoutes } from "./presentation/routes/profile.routes";

export interface ProfileModuleDependencies {
    profileRepository?: IProfileRepository;
    userRepository?: IUserPasswordRepository;
    passwordService?: IPasswordService;
    emailService?: IEmailService;
    authMiddleware?: RequestHandler;
    isBlockedMiddleware?: RequestHandler;
}

/**
 * Factory function to create fully configured Profile Module instances with dependency injection.
 */
export function createProfileModule(deps: ProfileModuleDependencies = {}) {
    const profileRepo = deps.profileRepository ?? new PrismaProfileRepository(defaultPrisma);
    const userRepo = deps.userRepository ?? new PrismaUserRepository(defaultPrisma);
    const pwdService = deps.passwordService ?? new BcryptPasswordService();
    const mailService = deps.emailService ?? defaultEmailService;

    const getProfile = new GetProfile(profileRepo);
    const updateProfile = new UpdateProfile(profileRepo);
    const updateStudentProfile = new UpdateStudentProfile(profileRepo);
    const updateTeacherProfile = new UpdateTeacherProfile(profileRepo);
    const submitTeacherVerification = new SubmitTeacherVerification(profileRepo, mailService);
    const changePassword = new ChangePassword(userRepo, pwdService, mailService);

    const getProfileController = new GetProfileController(getProfile);
    const updateProfileController = new UpdateProfileController(updateProfile);
    const updateStudentProfileController = new UpdateStudentProfileController(updateStudentProfile);
    const updateTeacherProfileController = new UpdateTeacherProfileController(updateTeacherProfile);
    const submitTeacherVerificationController = new SubmitTeacherVerificationController(submitTeacherVerification);
    const changePasswordController = new ChangePasswordController(changePassword);

    const profileRoutes = new ProfileRoutes(
        getProfileController,
        updateProfileController,
        updateStudentProfileController,
        updateTeacherProfileController,
        submitTeacherVerificationController,
        changePasswordController,
        deps.authMiddleware,
        deps.isBlockedMiddleware
    );

    return {
        repository: profileRepo,
        useCases: {
            getProfile,
            updateProfile,
            updateStudentProfile,
            updateTeacherProfile,
            submitTeacherVerification,
            changePassword,
        },
        controllers: {
            getProfileController,
            updateProfileController,
            updateStudentProfileController,
            updateTeacherProfileController,
            submitTeacherVerificationController,
            changePasswordController,
        },
        routes: profileRoutes,
        router: profileRoutes.router,
    };
}

// Default module instance for backwards compatibility
const defaultModule = createProfileModule();

export const profileRepository = defaultModule.repository;
export const profileRouter = defaultModule.router;

// Domain & Contract Exports
export * from "./domain/entities/profile.entity";
export * from "./domain/dtos/update-profile.dto";
export * from "./domain/dtos/update-student-profile.dto";
export * from "./domain/dtos/update-teacher-profile.dto";
export * from "./domain/dtos/change-password.dto";
export * from "./domain/errors";
export * from "./domain/policies";
export * from "./domain/repositories/profile.repository";

// Infrastructure Exports
export * from "./infrastructure/repositories/prisma-profile.repository";

// Application Exports
export * from "./application/use-cases/get-profile.usecase";
export * from "./application/use-cases/update-profile.usecase";
export * from "./application/use-cases/update-student-profile.usecase";
export * from "./application/use-cases/update-teacher-profile.usecase";
export * from "./application/use-cases/submit-teacher-verification.usecase";
export * from "./application/use-cases/change-password.usecase";

// Presentation Exports
export * from "./presentation/controllers/get-profile.controller";
export * from "./presentation/controllers/update-profile.controller";
export * from "./presentation/controllers/update-student-profile.controller";
export * from "./presentation/controllers/update-teacher-profile.controller";
export * from "./presentation/controllers/submit-teacher-verification.controller";
export * from "./presentation/controllers/change-password.controller";
export * from "./presentation/schemas";
export * from "./presentation/validators/profile.validator";
export * from "./presentation/validators/change-password.validator";
export * from "./presentation/routes/profile.routes";

export default profileRouter;
