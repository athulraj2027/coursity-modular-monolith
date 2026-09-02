import { PrismaClient } from "@prisma/client";
import { CreateUserData, UserRepository } from "../../domain/repositories/user.repository";
import { User, UserRole, AuthProvider } from "../../domain/entities/user.entity";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export class PrismaUserRepository implements UserRepository {
    constructor(
        private readonly prisma: PrismaClient = defaultPrisma,
    ) { }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) return null;
        return this.mapToEntity(user);
    }

    async create(data: CreateUserData): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase().trim(),
                password: data.password ?? null,
                role: data.role as any,
                authProvider: data.authProvider as any,
                isEmailVerified: data.isEmailVerified ?? false,
            },
        });
        return this.mapToEntity(user);
    }

    async update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email.toLowerCase().trim() } : {}),
                ...(data.password !== undefined ? { password: data.password } : {}),
                ...(data.role !== undefined ? { role: data.role as any } : {}),
                ...(data.authProvider !== undefined ? { authProvider: data.authProvider as any } : {}),
                ...(data.isEmailVerified !== undefined ? { isEmailVerified: data.isEmailVerified } : {}),
            },
        });
        return this.mapToEntity(user);
    }

    async updatePassword(id: string, newPasswordHash: string): Promise<User> {
        return this.update(id, { password: newPasswordHash });
    }

    private mapToEntity(raw: any): User {
        return {
            id: raw.id,
            name: raw.name,
            email: raw.email,
            password: raw.password,
            role: raw.role as UserRole,
            authProvider: raw.authProvider as AuthProvider,
            isEmailVerified: raw.isEmailVerified,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}