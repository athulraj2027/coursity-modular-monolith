import { IUserQueryRepository, IUserAdminRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { TokenRepository } from "@/modules/auth/domain/repositories/token.repository";
import { UserNotFoundError } from "../../domain/errors/user.errors";
import { UserBlockPolicy } from "../../domain/policies/user-block.policy";

export class BlockUser {
    constructor(
        private readonly userRepository: IUserQueryRepository & IUserAdminRepository,
        private readonly tokenRepository?: TokenRepository
    ) { }

    async execute(userId: string, isBlocked?: boolean): Promise<{ user: Omit<User, "password">; message: string }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new UserNotFoundError("User not found");
        }

        const targetStatus = UserBlockPolicy.determineTargetStatus(existingUser.isBlocked, isBlocked);
        UserBlockPolicy.validateBlockAllowed(existingUser.role, targetStatus);

        const updatedUser = await this.userRepository.updateBlockStatus(userId, targetStatus);

        // If blocking the user, invalidate their active refresh token session
        if (targetStatus && this.tokenRepository) {
            try {
                await this.tokenRepository.deleteRefreshToken(userId);
            } catch {
                // ignore if Redis is offline
            }
        }

        const { password, ...safeUser } = updatedUser;
        const actionMessage = UserBlockPolicy.formatBlockMessage(targetStatus);

        return {
            user: safeUser,
            message: actionMessage,
        };
    }
}
