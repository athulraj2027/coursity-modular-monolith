import { UserRepository } from "@/modules/user";
import { OtpRepository } from "../../domain/repositories/redis-otp.repository";
import { BadRequestError, ConflictError } from "@/app/errors";
import { ResendOtpInputDTO, ResendOtpOutputDTO } from "../dtos/resend-otp.dto";

export class ResendSignupOtp {
    private readonly RESEND_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute

    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly userRepository: UserRepository
    ) { }

    async execute(input: ResendOtpInputDTO): Promise<ResendOtpOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Check if user already exists in DB
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("An account with this email already exists and is verified.");
        }

        // 2. Fetch pending registration data from Redis
        const stored = await this.otpRepository.getSignupOtp(email);
        if (!stored) {
            throw new BadRequestError("No pending registration found for this email. Please sign up first.");
        }

        // 3. Check 1-minute cooldown from last OTP creation
        const timeElapsed = Date.now() - (stored.createdAt || 0);
        if (timeElapsed < this.RESEND_COOLDOWN_MS) {
            const remainingMinutes = Math.ceil((this.RESEND_COOLDOWN_MS - timeElapsed) / (60 * 1000));
            throw new BadRequestError(
                `Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before requesting a new OTP.`
            );
        }

        // 4. Generate new 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // 5. Overwrite in Redis with updated timestamp and reset TTL
        await this.otpRepository.saveSignupOtp(email, newOtp, stored.userData);

        // 6. DEV Log (or send email via mailer)
        console.log(`🔑 [DEV ONLY] Resent Signup OTP for ${email}: ${newOtp}`);

        return {
            email,
            message: "A new OTP has been sent to your email.",
        };
    }
}
