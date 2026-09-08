import { NotFoundError, BadRequestError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { TokenRepository } from "@/modules/auth/domain/repositories/token.repository";

export class BlockUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenRepository?: TokenRepository
    ) { }

    async execute(userId: string, isBlocked?: boolean): Promise<{ user: Omit<User, "password">; message: string }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        // Target status: toggle if isBlocked is undefined, otherwise use provided value
        const targetStatus = isBlocked !== undefined ? isBlocked : !existingUser.isBlocked;

        if (existingUser.role === "ADMIN" && targetStatus) {
            throw new BadRequestError("Cannot block an administrator account");
        }

        const updatedUser = await this.userRepository.updateBlockStatus(userId, targetStatus);

        // If blocking the user, invalidate their active refresh token session
        if (targetStatus && this.tokenRepository) {
            try {
                await this.tokenRepository.deleteRefreshToken(userId);
            } catch (e) {
                // ignore if Redis is offline
            }
        }

        const { password, ...safeUser } = updatedUser;
        const actionText = targetStatus ? "blocked" : "unblocked";

        return {
            user: safeUser,
            message: `User has been ${actionText} successfully`,
        };
    }
}
