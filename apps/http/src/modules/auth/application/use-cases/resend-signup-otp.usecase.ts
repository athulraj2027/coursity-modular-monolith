import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { ISignupOtpRepository } from "../../domain/repositories/otp.repository.interface";
import { BadRequestError, ConflictError } from "@/app/errors";
import { ResendOtpInputDTO, ResendOtpOutputDTO } from "../dtos/resend-otp.dto";
import { IEmailService } from "@/infrastructure/email";
import { IOtpGenerator } from "../../domain/services/otp-generator.service.interface";
import { CryptoOtpGeneratorService } from "../../infrastructure/services/crypto-otp-generator.service";
import { OtpCooldownPolicy } from "../../domain/policies/otp-cooldown.policy";

export class ResendSignupOtp {
    private readonly otpGenerator: IOtpGenerator;

    constructor(
        private readonly otpRepository: ISignupOtpRepository,
        private readonly userRepository: UserRepository,
        private readonly emailService?: IEmailService,
        otpGenerator?: IOtpGenerator
    ) {
        this.otpGenerator = otpGenerator || new CryptoOtpGeneratorService();
    }

    async execute(input: ResendOtpInputDTO): Promise<ResendOtpOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Check if user already exists in DB
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("An account with this email already exists and is verified.");
        }

        // 2. Fetch pending registration data from repository
        const stored = await this.otpRepository.getSignupOtp(email);
        if (!stored) {
            throw new BadRequestError("No pending registration found for this email. Please sign up first.");
        }

        // 3. Check cooldown via OtpCooldownPolicy
        OtpCooldownPolicy.assertCooldownElapsed(stored.createdAt, undefined, "a new OTP");

        // 4. Generate new cryptographically secure 6-digit OTP
        const newOtp = this.otpGenerator.generate(6);

        // 5. Overwrite in repository with updated timestamp and reset TTL
        await this.otpRepository.saveSignupOtp(email, newOtp, stored.userData);

        // 6. Asynchronously dispatch OTP email via queue
        if (this.emailService) {
            const name = stored.userData?.name || "";
            await this.emailService.sendSignupOtp(email, newOtp, name).catch((err) => {
                console.error(`⚠️ Failed to enqueue resent signup OTP email for ${email}:`, err?.message || err);
            });
        } else {
            console.log(`🔑 [DEV ONLY] Resent Signup OTP for ${email}: ${newOtp}`);
        }

        return {
            email,
            message: "A new OTP has been sent to your email.",
        };
    }
}
