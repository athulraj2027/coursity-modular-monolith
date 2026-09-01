// import { PrismaClient } from "@prisma/client";
import { CreateUserData, UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export class PrismaUserRepository implements UserRepository {
    constructor(
        // private readonly prisma: PrismaClient,
    ) { }


    async findByEmail(email: string): Promise<User | null> {
        // db code
        return null;
    }
    async create(data: CreateUserData): Promise<User> {
        return {
            id: 'null',
            name: '',
            email: '',
            password: '',
            role: 'STUDENT',
            authProvider: 'LOCAL',
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
            ;
    }
}