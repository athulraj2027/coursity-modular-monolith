import { IUserQueryRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNotFoundError } from "../../domain/errors/user.errors";

export class GetProfile {
    constructor(private readonly userRepository: IUserQueryRepository) { }

    async execute(userId: string): Promise<Omit<User, "password">> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFoundError("User profile not found");
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }
}
