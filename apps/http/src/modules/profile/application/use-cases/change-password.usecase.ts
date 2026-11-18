import { IUserPasswordRepository } from "../../domain/repositories/profile.repository";
import { IEmailService } from "@/infrastructure/email";
import { IPasswordService } from "@/infrastructure/security";
import { ChangePasswordDto, ChangePasswordResultDto } from "../../domain/dtos/change-password.dto";
import { ProfileNotFoundError, PasswordChangeNotAllowedError } from "../../domain/errors/profile.errors";

export class ChangePassword {
    constructor(
        private readonly userRepository: IUserPasswordRepository,
        private readonly passwordService: IPasswordService,
        private readonly emailService: IEmailService
    ) {}

    async execute(dto: ChangePasswordDto): Promise<ChangePasswordResultDto> {
        // 1. Fetch user from repository
        const user = await this.userRepository.findById(dto.userId);

        if (!user) {
            throw new ProfileNotFoundError("User account not found");
        }

        // 2. Reject password change for Google SSO accounts
        if (user.authProvider === "GOOGLE") {
            throw new PasswordChangeNotAllowedError(
                "Accounts authenticated via Google Single Sign-On do not use a password. Password changes are not supported for Google accounts."
            );
        }

        // 3. Validate current password if user has an existing password
        if (user.password) {
            if (!dto.currentPassword) {
                throw new PasswordChangeNotAllowedError("Current password is required to update your password");
            }

            const isCurrentValid = await this.passwordService.compare(dto.currentPassword, user.password);
            if (!isCurrentValid) {
                throw new PasswordChangeNotAllowedError("The current password you entered is incorrect");
            }

            // Check if new password matches current password
            const isSame = await this.passwordService.compare(dto.newPassword, user.password);
            if (isSame) {
                throw new PasswordChangeNotAllowedError("New password cannot be the same as your current password");
            }
        }

        // 4. Hash the new password securely
        const hashedPassword = await this.passwordService.hash(dto.newPassword);

        // 5. Update password in repository
        await this.userRepository.updatePassword(dto.userId, hashedPassword);

        // 6. Send security notification email to user
        try {
            await this.emailService.sendPasswordChangedNotification(user.email, user.name);
        } catch (emailErr) {
            console.warn("⚠️ Failed to dispatch password change notification email:", emailErr);
        }

        return {
            success: true,
            message: "Password has been updated successfully. A security confirmation email has been sent to your address.",
        };
    }
}
