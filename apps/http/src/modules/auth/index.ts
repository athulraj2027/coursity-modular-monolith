import { SignupUser } from "./application/use-cases/signup.user.usecase";
import { SignupController } from "./presentation/controllers/signup.controller";
import { AuthRoutes } from "./presentation/routes/auth.routes";

import { PrismaUserRepository } from "@/modules/user";
import { BcryptPasswordService } from "./infrastructure/services/bcrypt/bcrypt-password.service";

const userRepository = new PrismaUserRepository();
const passwordService = new BcryptPasswordService();

const signupUser = new SignupUser(userRepository, passwordService);
const signupController = new SignupController(signupUser);
const authRoutes = new AuthRoutes(signupController);

export * from "./application/dtos";
export const authRouter = authRoutes.router;
export default authRouter;
