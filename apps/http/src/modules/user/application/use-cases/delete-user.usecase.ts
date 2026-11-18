import { IUserQueryRepository, IUserMutationRepository } from "../../domain/repositories/user.repository";
import { UserNotFoundError } from "../../domain/errors/user.errors";

export class DeleteUser {
    constructor(
        private readonly userRepository: IUserQueryRepository & IUserMutationRepository
    ) { }

    async execute(userId: string): Promise<{ success: boolean; message: string }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new UserNotFoundError("User not found");
        }

        await this.userRepository.delete(userId);
        return { success: true, message: "User deleted successfully" };
    }
}
