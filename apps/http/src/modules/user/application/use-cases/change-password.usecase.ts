import { BadRequestError, NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { PasswordService } from "../../domain/services/password.service";
import { ChangePasswordData } from "../../domain/dtos/change-password.dto";

export class ChangePassword {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService
    ) { }

    async execute(userId: string, data: ChangePasswordData): Promise<{ message: string }> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // If user already has a password, verify current password
        if (user.password) {
            if (!data.currentPassword) {
                throw new BadRequestError("Current password is required");
            }

            const isValid = await this.passwordService.compare(data.currentPassword, user.password);
            if (!isValid) {
                throw new BadRequestError("Incorrect current password");
            }
        }

        // Hash new password and save
        const hashedPassword = await this.passwordService.hash(data.newPassword);
        await this.userRepository.updatePassword(userId, hashedPassword);

        return { message: "Password updated successfully" };
    }
}
