import { NotFoundError, BadRequestError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class BlockUser {
    constructor(private readonly userRepository: UserRepository) { }

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
        const { password, ...safeUser } = updatedUser;

        const actionText = targetStatus ? "blocked" : "unblocked";

        return {
            user: safeUser,
            message: `User has been ${actionText} successfully`,
        };
    }
}
