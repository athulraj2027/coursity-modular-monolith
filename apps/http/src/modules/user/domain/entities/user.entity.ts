
export type UserRole =
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

export type AuthProvider =
    | "LOCAL"
    | "GOOGLE";

export interface User {
    id: string;
    name: string;
    email: string;
    password: string | null;
    role: UserRole;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
