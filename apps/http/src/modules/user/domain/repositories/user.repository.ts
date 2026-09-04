import { User } from "../entities/user.entity";
import { CreateUserData } from "../dtos/create-user.dto";
import { FindUsersOptions, PaginatedUsersResult } from "../dtos/user-query.dto";

export { CreateUserData, CreateUserDTO } from "../dtos/create-user.dto";
export { FindUsersOptions, PaginatedUsersResult } from "../dtos/user-query.dto";

export interface UserRepository {
    findById(
        id: string
    ): Promise<User | null>;

    findByEmail(
        email: string
    ): Promise<User | null>;

    create(
        data: CreateUserData
    ): Promise<User>;

    update(
        id: string,
        data: Partial<Omit<User, "id" | "createdAt">>
    ): Promise<User>;

    updatePassword(
        id: string,
        newPasswordHash: string
    ): Promise<User>;

    updateBlockStatus(
        id: string,
        isBlocked: boolean
    ): Promise<User>;

    findMany(
        options?: FindUsersOptions
    ): Promise<PaginatedUsersResult>;

    delete(
        id: string
    ): Promise<boolean>;

    count(
        where?: any
    ): Promise<number>;
}
