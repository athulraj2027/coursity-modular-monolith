import { NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User, UserRole } from "../../domain/entities/user.entity";

export class UpdateUserRole {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string, role: UserRole): Promise<Omit<User, "password">> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        const updatedUser = await this.userRepository.update(userId, { role });
        const { password, ...safeUser } = updatedUser;
        return safeUser;
    }
}
