// Repositories & Services
import { PrismaProfileRepository } from "./infrastructure/repositories/prisma-profile.repository";

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

// Middlewares & Routes
import { ProfileRoutes } from "./presentation/routes/profile.routes";

// 1. Repositories
const profileRepository = new PrismaProfileRepository();

import { emailService } from "@/modules/email";
import defaultPrisma from "@/infrastructure/database/prisma.client";

// 2. Use Cases
const getProfile = new GetProfile(profileRepository);
const updateProfile = new UpdateProfile(profileRepository);
const updateStudentProfile = new UpdateStudentProfile(profileRepository);
const updateTeacherProfile = new UpdateTeacherProfile(profileRepository);
const submitTeacherVerification = new SubmitTeacherVerification(profileRepository, emailService);
const changePassword = new ChangePassword(defaultPrisma, emailService);

// 3. Controllers
const getProfileController = new GetProfileController(getProfile);
const updateProfileController = new UpdateProfileController(updateProfile);
const updateStudentProfileController = new UpdateStudentProfileController(updateStudentProfile);
const updateTeacherProfileController = new UpdateTeacherProfileController(updateTeacherProfile);
const submitTeacherVerificationController = new SubmitTeacherVerificationController(submitTeacherVerification);
const changePasswordController = new ChangePasswordController(changePassword);

// 4. Routes
const profileRoutes = new ProfileRoutes(
    getProfileController,
    updateProfileController,
    updateStudentProfileController,
    updateTeacherProfileController,
    submitTeacherVerificationController,
    changePasswordController
);

// Exports
export * from "./domain/entities/profile.entity";
export * from "./domain/dtos/update-profile.dto";
export * from "./domain/dtos/update-student-profile.dto";
export * from "./domain/dtos/update-teacher-profile.dto";
export * from "./domain/dtos/change-password.dto";
export * from "./domain/repositories/profile.repository";
export * from "./infrastructure/repositories/prisma-profile.repository";
export * from "./application/use-cases/get-profile.usecase";
export * from "./application/use-cases/update-profile.usecase";
export * from "./application/use-cases/update-student-profile.usecase";
export * from "./application/use-cases/update-teacher-profile.usecase";
export * from "./application/use-cases/submit-teacher-verification.usecase";
export * from "./application/use-cases/change-password.usecase";
export * from "./presentation/controllers/get-profile.controller";
export * from "./presentation/controllers/update-profile.controller";
export * from "./presentation/controllers/update-student-profile.controller";
export * from "./presentation/controllers/update-teacher-profile.controller";
export * from "./presentation/controllers/submit-teacher-verification.controller";
export * from "./presentation/controllers/change-password.controller";
export * from "./presentation/validators/profile.validator";
export * from "./presentation/validators/change-password.validator";
export * from "./presentation/routes/profile.routes";

export const profileRouter = profileRoutes.router;
export default profileRouter;
