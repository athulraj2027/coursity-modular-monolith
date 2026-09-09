import { UserRepository } from "@/modules/user";
import { OtpRepository } from "../../domain/repositories/redis-otp.repository";
import { BadRequestError } from "@/app/errors";
import { ForgotPasswordInputDTO, ForgotPasswordOutputDTO } from "../dtos/forgot-password.dto";
import { IEmailService } from "@/modules/email";

export class ForgotPassword {
    private readonly RESEND_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute

    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: OtpRepository,
        private readonly emailService?: IEmailService
    ) { }

    async execute(input: ForgotPasswordInputDTO): Promise<ForgotPasswordOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Check if user exists
        const user = await this.userRepository.findByEmail(email);

        // Security best practice: If user doesn't exist, we can return generic message
        // However, if user is OAuth-only, we should inform them to sign in with Google
        if (user && user.authProvider === "GOOGLE" && !user.password) {
            throw new BadRequestError("This account uses Google Sign-In. Please sign in with Google.");
        }

        // Enforce role consistency if a specific portal role was requested
        if (user && input.role && user.role !== input.role) {
            if (user.role === "ADMIN") {
                throw new BadRequestError("This account is registered as an Administrator. Please use the Admin portal.");
            } else if (user.role === "TEACHER") {
                throw new BadRequestError("This account is registered as a Teacher. Please use the Teacher portal to reset your password.");
            } else if (user.role === "STUDENT") {
                throw new BadRequestError("This account is registered as a Student. Please use the Student portal to reset your password.");
            }
        }

        if (user) {
            // 2. Check cooldown from previous OTP request
            const existingOtp = await this.otpRepository.getResetPasswordOtp(email);
            if (existingOtp) {
                const timeElapsed = Date.now() - (existingOtp.createdAt || 0);
                if (timeElapsed < this.RESEND_COOLDOWN_MS) {
                    const remainingMinutes = Math.ceil((this.RESEND_COOLDOWN_MS - timeElapsed) / (60 * 1000));
                    throw new BadRequestError(
                        `Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before requesting a new password reset OTP.`
                    );
                }
            }

            // 3. Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // 4. Save to Redis with 10 minute TTL
            await this.otpRepository.saveResetPasswordOtp(email, otp, 600);

            // 5. Asynchronously dispatch password reset OTP email via queue
            if (this.emailService) {
                await this.emailService.sendPasswordResetOtp(email, otp, user.name).catch((err) => {
                    console.error(`⚠️ Failed to enqueue password reset OTP email for ${email}:`, err?.message || err);
                });
            } else {
                console.log(`🔑 [DEV ONLY] Password Reset OTP for ${email}: ${otp}`);
            }
        }

        return {
            email,
            message: "If an account with this email exists, a password reset OTP has been sent.",
        };
    }
}
