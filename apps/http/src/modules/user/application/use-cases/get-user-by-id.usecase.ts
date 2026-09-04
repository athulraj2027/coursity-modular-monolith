import { NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class GetUserById {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(id: string): Promise<Omit<User, "password">> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }
}
