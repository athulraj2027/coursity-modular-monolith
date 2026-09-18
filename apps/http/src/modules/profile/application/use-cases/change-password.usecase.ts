import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { IEmailService } from "@/modules/email";
import { PasswordService } from "@/modules/auth/domain/services/password.service";
import { BadRequestError, NotFoundError } from "@/app/errors";
import { ChangePasswordDto, ChangePasswordResultDto } from "../../domain/dtos/change-password.dto";

export class ChangePassword {
    constructor(
        private readonly prisma: PrismaClient = defaultPrisma,
        private readonly passwordService: PasswordService,
        private readonly emailService: IEmailService
    ) {}

    async execute(dto: ChangePasswordDto): Promise<ChangePasswordResultDto> {
        // 1. Fetch user from database
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                authProvider: true,
            },
        });

        if (!user) {
            throw new NotFoundError("User account not found");
        }

        // 2. Reject password change for Google SSO accounts
        if (user.authProvider === "GOOGLE") {
            throw new BadRequestError("Accounts authenticated via Google Single Sign-On do not use a password. Password changes are not supported for Google accounts.");
        }

        // 3. Validate current password if user has an existing password
        if (user.password) {
            if (!dto.currentPassword) {
                throw new BadRequestError("Current password is required to update your password");
            }

            const isCurrentValid = await this.passwordService.compare(dto.currentPassword, user.password);
            if (!isCurrentValid) {
                throw new BadRequestError("The current password you entered is incorrect");
            }

            // Check if new password matches current password
            const isSame = await this.passwordService.compare(dto.newPassword, user.password);
            if (isSame) {
                throw new BadRequestError("New password cannot be the same as your current password");
            }
        }

        // 3. Hash the new password securely
        const hashedPassword = await this.passwordService.hash(dto.newPassword);

        // 4. Update password in database
        await this.prisma.user.update({
            where: { id: dto.userId },
            data: {
                password: hashedPassword,
            },
        });

        // 5. Send security notification email to user
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
