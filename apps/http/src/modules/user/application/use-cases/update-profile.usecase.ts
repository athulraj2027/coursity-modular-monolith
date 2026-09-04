import { NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UpdateUserData } from "../../domain/dtos/update-user.dto";
import { User } from "../../domain/entities/user.entity";

export class UpdateProfile {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string, data: UpdateUserData): Promise<Omit<User, "password">> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new NotFoundError("User not found");
        }

        const updatedUser = await this.userRepository.update(userId, {
            name: data.name ?? existingUser.name,
        });

        const { password, ...safeUser } = updatedUser;
        return safeUser;
    }
}
