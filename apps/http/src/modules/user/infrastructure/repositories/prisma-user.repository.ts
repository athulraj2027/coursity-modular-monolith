// import { PrismaClient } from "@prisma/client";
import { CreateUserData, UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class PrismaUserRepository implements UserRepository {
    constructor(
        // private readonly prisma: PrismaClient,
    ) { }


    async findById(id: string): Promise<User | null> {
        // db code placeholder
        return null;
    }

    async findByEmail(email: string): Promise<User | null> {
        // db code
        return null;
    }

    async create(data: CreateUserData): Promise<User> {
        return {
            id: 'null',
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            authProvider: data.authProvider,
            isEmailVerified: data.isEmailVerified,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
        return {
            id,
            name: data.name ?? '',
            email: data.email ?? '',
            password: data.password ?? null,
            role: data.role ?? 'STUDENT',
            authProvider: data.authProvider ?? 'LOCAL',
            isEmailVerified: data.isEmailVerified ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    async updatePassword(id: string, newPasswordHash: string): Promise<User> {
        return this.update(id, { password: newPasswordHash, updatedAt: new Date() });
    }
}