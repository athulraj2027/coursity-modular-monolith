import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IPasswordResetOtpRepository } from "../../domain/repositories/otp.repository.interface";
import { BadRequestError } from "@/app/errors";
import { ForgotPasswordInputDTO, ForgotPasswordOutputDTO } from "../dtos/forgot-password.dto";
import { IEmailService } from "@/infrastructure/email";
import { IOtpGenerator } from "../../domain/services/otp-generator.service.interface";
import { CryptoOtpGeneratorService } from "../../infrastructure/services/crypto-otp-generator.service";
import { OtpCooldownPolicy } from "../../domain/policies/otp-cooldown.policy";
import { PortalAccessPolicy } from "../../domain/policies/portal-access.policy";

export class ForgotPassword {
    private readonly otpGenerator: IOtpGenerator;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly otpRepository: IPasswordResetOtpRepository,
        private readonly emailService?: IEmailService,
        otpGenerator?: IOtpGenerator
    ) {
        this.otpGenerator = otpGenerator || new CryptoOtpGeneratorService();
    }

    async execute(input: ForgotPasswordInputDTO): Promise<ForgotPasswordOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Check if user exists
        const user = await this.userRepository.findByEmail(email);

        // Security best practice: If user is OAuth-only, inform them to sign in with OAuth provider
        if (user && user.authProvider && user.authProvider !== "LOCAL" && !user.password) {
            const providerName = user.authProvider === "GOOGLE" ? "Google" : user.authProvider;
            throw new BadRequestError(`This account uses ${providerName} Sign-In. Please sign in with ${providerName}.`);
        }

        // Enforce role consistency via PortalAccessPolicy (OCP)
        if (user) {
            PortalAccessPolicy.assertPortalRoleAccess(user.role, input.role, "reset-password");
        }

        if (user) {
            // 2. Check cooldown from previous OTP request via OtpCooldownPolicy
            const existingOtp = await this.otpRepository.getResetPasswordOtp(email);
            if (existingOtp) {
                OtpCooldownPolicy.assertCooldownElapsed(existingOtp.createdAt, undefined, "a new password reset OTP");
            }

            // 3. Generate cryptographically secure 6-digit OTP
            const otp = this.otpGenerator.generate(6);

            // 4. Save to repository with 10 minute TTL
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
