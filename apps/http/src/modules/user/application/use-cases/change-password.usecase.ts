import { IUserQueryRepository, IUserMutationRepository } from "../../domain/repositories/user.repository";
import { IPasswordService } from "@/infrastructure/security";
import { ChangePasswordData } from "../../domain/dtos/change-password.dto";
import {
    UserNotFoundError,
    CurrentPasswordRequiredError,
    InvalidCurrentPasswordError,
} from "../../domain/errors/user.errors";

export class ChangePassword {
    constructor(
        private readonly userRepository: IUserQueryRepository & IUserMutationRepository,
        private readonly passwordService: IPasswordService
    ) { }

    async execute(userId: string, data: ChangePasswordData): Promise<{ message: string }> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        // If user already has a password, verify current password
        if (user.password) {
            if (!data.currentPassword) {
                throw new CurrentPasswordRequiredError("Current password is required");
            }

            const isValid = await this.passwordService.compare(data.currentPassword, user.password);
            if (!isValid) {
                throw new InvalidCurrentPasswordError("Incorrect current password");
            }
        }

        // Hash new password and save
        const hashedPassword = await this.passwordService.hash(data.newPassword);
        await this.userRepository.updatePassword(userId, hashedPassword);

        return { message: "Password updated successfully" };
    }
}
