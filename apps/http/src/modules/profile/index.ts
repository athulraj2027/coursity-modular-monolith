// Repositories & Services
import { PrismaProfileRepository } from "./infrastructure/repositories/prisma-profile.repository";

// Use Cases
import { GetProfile } from "./application/use-cases/get-profile.usecase";
import { UpdateProfile } from "./application/use-cases/update-profile.usecase";
import { UpdateStudentProfile } from "./application/use-cases/update-student-profile.usecase";
import { UpdateTeacherProfile } from "./application/use-cases/update-teacher-profile.usecase";

// Controllers
import { GetProfileController } from "./presentation/controllers/get-profile.controller";
import { UpdateProfileController } from "./presentation/controllers/update-profile.controller";
import { UpdateStudentProfileController } from "./presentation/controllers/update-student-profile.controller";
import { UpdateTeacherProfileController } from "./presentation/controllers/update-teacher-profile.controller";

// Middlewares & Routes
import { ProfileRoutes } from "./presentation/routes/profile.routes";

// 1. Repositories
const profileRepository = new PrismaProfileRepository();

// 2. Use Cases
const getProfile = new GetProfile(profileRepository);
const updateProfile = new UpdateProfile(profileRepository);
const updateStudentProfile = new UpdateStudentProfile(profileRepository);
const updateTeacherProfile = new UpdateTeacherProfile(profileRepository);

// 3. Controllers
const getProfileController = new GetProfileController(getProfile);
const updateProfileController = new UpdateProfileController(updateProfile);
const updateStudentProfileController = new UpdateStudentProfileController(updateStudentProfile);
const updateTeacherProfileController = new UpdateTeacherProfileController(updateTeacherProfile);

// 4. Routes
const profileRoutes = new ProfileRoutes(
    getProfileController,
    updateProfileController,
    updateStudentProfileController,
    updateTeacherProfileController
);

// Exports
export * from "./domain/entities/profile.entity";
export * from "./domain/dtos/update-profile.dto";
export * from "./domain/dtos/update-student-profile.dto";
export * from "./domain/dtos/update-teacher-profile.dto";
export * from "./domain/repositories/profile.repository";
export * from "./infrastructure/repositories/prisma-profile.repository";
export * from "./application/use-cases/get-profile.usecase";
export * from "./application/use-cases/update-profile.usecase";
export * from "./application/use-cases/update-student-profile.usecase";
export * from "./application/use-cases/update-teacher-profile.usecase";
export * from "./presentation/controllers/get-profile.controller";
export * from "./presentation/controllers/update-profile.controller";
export * from "./presentation/controllers/update-student-profile.controller";
export * from "./presentation/controllers/update-teacher-profile.controller";
export * from "./presentation/validators/profile.validator";
export * from "./presentation/routes/profile.routes";

export const profileRouter = profileRoutes.router;
export default profileRouter;
