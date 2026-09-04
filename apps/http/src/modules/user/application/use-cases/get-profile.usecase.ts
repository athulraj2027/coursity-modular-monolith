import { NotFoundError } from "@/app/errors";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class GetProfile {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(userId: string): Promise<Omit<User, "password">> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User profile not found");
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }
}
