import { User } from "../entities/user.entity";
import { CreateUserData } from "../dtos/create-user.dto";
export { CreateUserData, CreateUserDTO } from "../dtos/create-user.dto";

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
}
