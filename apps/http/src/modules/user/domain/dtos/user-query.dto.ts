import { AuthProvider, User, UserRole } from "../entities/user.entity";

export interface FindUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    authProvider?: AuthProvider;
    isBlocked?: boolean;
    sortBy?: "createdAt" | "name" | "email";
    sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersResult {
    users: Omit<User, "password">[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
