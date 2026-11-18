import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { IPasswordHasher } from "@/infrastructure/security";
import { IPasswordResetOtpRepository } from "../../domain/repositories/otp.repository.interface";
import { IDeleteRefreshTokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError, NotFoundError } from "@/app/errors";
import { ResetPasswordInputDTO, ResetPasswordOutputDTO } from "../dtos/reset-password.dto";

export class ResetPassword {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: IPasswordHasher,
        private readonly otpRepository: IPasswordResetOtpRepository,
        private readonly tokenRepository: IDeleteRefreshTokenRepository
    ) { }

    async execute(input: ResetPasswordInputDTO): Promise<ResetPasswordOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Fetch cached OTP from repository
        const stored = await this.otpRepository.getResetPasswordOtp(email);
        if (!stored) {
            throw new BadRequestError("Password reset OTP has expired or is invalid");
        }

        // 2. Validate OTP
        if (stored.otp !== input.otp) {
            throw new BadRequestError("Invalid OTP");
        }

        // 3. Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // 4. Hash new password
        const hashedPassword = await this.passwordService.hash(input.newPassword);

        // 5. Update user in DB
        await this.userRepository.updatePassword(user.id, hashedPassword);

        // 6. Invalidate reset OTP in repository
        await this.otpRepository.deleteResetPasswordOtp(email);

        // 7. Revoke active refresh tokens for this user across sessions
        await this.tokenRepository.deleteRefreshToken(user.id);

        return {
            message: "Password has been reset successfully. Please log in with your new password.",
        };
    }
}
