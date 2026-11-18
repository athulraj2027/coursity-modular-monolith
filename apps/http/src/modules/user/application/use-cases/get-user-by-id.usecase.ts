import { IUserQueryRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNotFoundError } from "../../domain/errors/user.errors";

export class GetUserById {
    constructor(private readonly userRepository: IUserQueryRepository) { }

    async execute(id: string): Promise<Omit<User, "password">> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new UserNotFoundError("User not found");
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }
}
