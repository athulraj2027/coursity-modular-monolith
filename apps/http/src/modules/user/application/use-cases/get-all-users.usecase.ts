import { UserRepository } from "../../domain/repositories/user.repository";
import { FindUsersOptions, PaginatedUsersResult } from "../../domain/dtos/user-query.dto";

export class GetAllUsers {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(options?: FindUsersOptions): Promise<PaginatedUsersResult> {
        return this.userRepository.findMany(options);
    }
}
