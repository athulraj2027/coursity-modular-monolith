import { PrismaClient } from "@prisma/client";
import {
    CreateUserData,
    FindUsersOptions,
    PaginatedUsersResult,
    UserRepository,
} from "../../domain/repositories/user.repository";
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
            },
        });
        return this.mapToEntity(user);
    }

    async updatePassword(id: string, newPasswordHash: string): Promise<User> {
        return this.update(id, { password: newPasswordHash });
    }

    async findMany(options: FindUsersOptions = {}): Promise<PaginatedUsersResult> {
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(100, options.limit || 10));
        const skip = (page - 1) * limit;

        const where: any = {};

        if (options.role) {
            where.role = options.role;
        }

        if (options.authProvider) {
            where.authProvider = options.authProvider;
        }

        if (options.search && options.search.trim() !== "") {
            const search = options.search.trim();
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        const sortBy = options.sortBy || "createdAt";
        const sortOrder = options.sortOrder || "desc";

        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        const sanitizedUsers = users.map((u) => {
            const entity = this.mapToEntity(u);
            const { password, ...safeUser } = entity;
            return safeUser as Omit<User, "password">;
        });

        return {
            users: sanitizedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }

    async count(where?: any): Promise<number> {
        return this.prisma.user.count({ where });
    }

    private mapToEntity(raw: any): User {
        return {
            id: raw.id,
            name: raw.name,
            email: raw.email,
            password: raw.password,
            role: raw.role as UserRole,
            authProvider: raw.authProvider as AuthProvider,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}