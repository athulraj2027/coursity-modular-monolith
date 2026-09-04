import { NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";

export class DeleteUser {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string): Promise<{ success: boolean; message: string }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        await this.userRepository.delete(userId);
        return { success: true, message: "User deleted successfully" };
    }
}
