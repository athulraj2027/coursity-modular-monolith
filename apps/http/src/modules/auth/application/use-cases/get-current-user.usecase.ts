import { UserRepository } from "@/modules/user";
import { UnauthorizedError } from "@/app/errors";

export class GetCurrentUser {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string) {
        if (!userId) {
            throw new UnauthorizedError("Unauthorized");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
        };
    }
}
