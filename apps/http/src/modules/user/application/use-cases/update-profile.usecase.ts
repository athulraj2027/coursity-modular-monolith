import { IUserQueryRepository, IUserMutationRepository } from "../../domain/repositories/user.repository";
import { UpdateUserData } from "../../domain/dtos/update-user.dto";
import { User } from "../../domain/entities/user.entity";
import { UserNotFoundError } from "../../domain/errors/user.errors";

export class UpdateProfile {
    constructor(
        private readonly userRepository: IUserQueryRepository & IUserMutationRepository
    ) { }

    async execute(userId: string, data: UpdateUserData): Promise<Omit<User, "password">> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new UserNotFoundError("User not found");
        }

        const updatedUser = await this.userRepository.update(userId, {
            name: data.name ?? existingUser.name,
        });

        const { password, ...safeUser } = updatedUser;
        return safeUser;
    }
}
