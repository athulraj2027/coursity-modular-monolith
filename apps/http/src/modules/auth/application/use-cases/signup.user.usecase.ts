import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IPasswordHasher } from "@/infrastructure/security";
import { ConflictError, BadRequestError } from "@/app/errors";
import { SignupUserInputDTO, SignupUserOutputDTO } from "../dtos/signup.dto";
import { ISignupOtpRepository } from "../../domain/repositories/otp.repository.interface";
import { IEmailService } from "@/infrastructure/email";
import { IOtpGenerator } from "../../domain/services/otp-generator.service.interface";
import { CryptoOtpGeneratorService } from "../../infrastructure/services/crypto-otp-generator.service";
import { OtpCooldownPolicy } from "../../domain/policies/otp-cooldown.policy";

export class SignupUser {
    private readonly otpGenerator: IOtpGenerator;

    constructor(
        private readonly repository: UserRepository,
        private readonly passwordService: IPasswordHasher,
        private readonly otpRepository: ISignupOtpRepository,
        private readonly emailService?: IEmailService,
        otpGenerator?: IOtpGenerator
    ) {
        this.otpGenerator = otpGenerator || new CryptoOtpGeneratorService();
    }

    async execute(input: SignupUserInputDTO): Promise<SignupUserOutputDTO> {
        const email = input.email.toLowerCase().trim();

        if (input.role === "ADMIN") {
            throw new BadRequestError("Administrator accounts cannot be registered via public signup.");
        }

        // 1. Check whether user already exists in DB
        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            if (existingUser.role === "ADMIN") {
                throw new ConflictError("This email is already registered as an Administrator. Please sign in through the Admin portal.");
            } else if (existingUser.role === "TEACHER") {
                throw new ConflictError("This email is already registered as a Teacher. Please sign in through the Teacher portal.");
            } else if (existingUser.role === "STUDENT") {
                throw new ConflictError("This email is already registered as a Student. Please sign in through the Student portal.");
            }
            throw new ConflictError("An account with this email already exists");
        }

        // 2. Check cooldown from previous OTP request via OtpCooldownPolicy
        const existingOtp = await this.otpRepository.getSignupOtp(email);
        if (existingOtp) {
            OtpCooldownPolicy.assertCooldownElapsed(existingOtp.createdAt, undefined, "a new one");
        }

        // 3. Hash password
        const hashedPassword = await this.passwordService.hash(input.password);

        // 4. Generate cryptographically secure OTP
        const otp = this.otpGenerator.generate(6);

        // 5. Store user data + OTP + timestamp in OTP repository
        await this.otpRepository.saveSignupOtp(email, otp, {
            name: input.name.trim(),
            email,
            password: hashedPassword,
            role: input.role || "STUDENT",
        });

        // 6. Asynchronously dispatch OTP email via queue
        if (this.emailService) {
            await this.emailService.sendSignupOtp(email, otp, input.name.trim()).catch((err) => {
                console.error(`⚠️ Failed to enqueue signup OTP email for ${email}:`, err?.message || err);
            });
        } else {
            console.log(`🔑 [DEV ONLY] Signup OTP for ${email}: ${otp}`);
        }

        return {
            email,
            message: "OTP sent to your email. Please verify to complete registration.",
        };
    }
}
