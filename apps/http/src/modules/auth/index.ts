import { SignupUser } from "./application/use-cases/signup.user.usecase";
import { VerifySignupOtp } from "./application/use-cases/verify-signup-otp.usecase";
import { ResendSignupOtp } from "./application/use-cases/resend-signup-otp.usecase";
import { SignupController } from "./presentation/controllers/signup.controller";
import { VerifyOtpController } from "./presentation/controllers/verify-otp.controller";
import { ResendOtpController } from "./presentation/controllers/resend-otp.controller";
import { AuthRoutes } from "./presentation/routes/auth.routes";

import { PrismaUserRepository } from "@/modules/user";
import { BcryptPasswordService } from "./infrastructure/services/bcrypt/bcrypt-password.service";
import { RedisOtpRepository } from "./infrastructure/repositories/redis-otp.repository";

// 1. Repositories & Services
const userRepository = new PrismaUserRepository();
const passwordService = new BcryptPasswordService();
const otpRepository = new RedisOtpRepository();

// 2. Use Cases
const signupUser = new SignupUser(userRepository, passwordService, otpRepository);
const verifySignupOtp = new VerifySignupOtp(otpRepository, userRepository);
const resendSignupOtp = new ResendSignupOtp(otpRepository, userRepository);

// 3. Controllers
const signupController = new SignupController(signupUser);
const verifyOtpController = new VerifyOtpController(verifySignupOtp);
const resendOtpController = new ResendOtpController(resendSignupOtp);

// 4. Routes
const authRoutes = new AuthRoutes(signupController, verifyOtpController, resendOtpController);

export * from "./application/dtos";
export const authRouter = authRoutes.router;
export default authRouter;
