import { User } from "../entities/user.entity";
import { CreateUserData } from "../dtos/create-user.dto";
export { CreateUserData, CreateUserDTO } from "../dtos/create-user.dto";

export interface UserRepository {
    findByEmail(
        email: string
    ): Promise<User | null>;

    create(
        data: CreateUserData
    ): Promise<User>;
}
