import { AuthProvider, UserRole } from "../entities/user.entity";

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string | null;
    role: UserRole;
    authProvider: AuthProvider;
}

export type CreateUserData = CreateUserDTO;
