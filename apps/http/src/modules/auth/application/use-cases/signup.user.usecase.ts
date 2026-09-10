import { UserRepository } from "@/modules/user";
import { PasswordService } from "../../domain/services/password.service";
import { ConflictError, BadRequestError } from "@/app/errors";
import { SignupUserInputDTO, SignupUserOutputDTO } from "../dtos/signup.dto";
import { OtpRepository } from "../../domain/repositories/redis-otp.repository";
import { IEmailService } from "@/modules/email";

export class SignupUser {
    private readonly RESEND_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute (60 seconds)

    constructor(
        private readonly repository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly otpRepository: OtpRepository,
        private readonly emailService?: IEmailService
    ) { }

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

        // 2. Check if an OTP was already sent to this email recently
        const existingOtp = await this.otpRepository.getSignupOtp(email);
        if (existingOtp) {
            const timeElapsed = Date.now() - (existingOtp.createdAt || 0);

            if (timeElapsed < this.RESEND_COOLDOWN_MS) {
                const remainingMinutes = Math.ceil((this.RESEND_COOLDOWN_MS - timeElapsed) / (60 * 1000));
                throw new BadRequestError(
                    `An OTP has already been sent. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before requesting a new one.`
                );
            }
        }

        // 3. Hash password
        const hashedPassword = await this.passwordService.hash(input.password);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Store user data + OTP + timestamp in Redis
        await this.otpRepository.saveSignupOtp(email, otp, {
            name: input.name.trim(),
            email,
            password: hashedPassword,
            role: input.role || "STUDENT",
        });

        // 5. Asynchronously dispatch OTP email via queue
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