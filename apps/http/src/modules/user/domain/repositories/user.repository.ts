import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import { User, ApprovalStatus } from "../entities/user.entity";
import { CreateUserData } from "../dtos/create-user.dto";
import { FindUsersOptions, PaginatedUsersResult } from "../dtos/user-query.dto";

export { CreateUserData, CreateUserDTO } from "../dtos/create-user.dto";
export { FindUsersOptions, PaginatedUsersResult } from "../dtos/user-query.dto";

export interface IUserQueryRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findMany(options?: FindUsersOptions): Promise<PaginatedUsersResult>;
    count(where?: any): Promise<number>;
}

export interface IUserMutationRepository {
    create(data: CreateUserData, ...args: any[]): Promise<User>;
    update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User>;
    updatePassword(id: string, newPasswordHash: string): Promise<User>;
    delete(id: string, ...args: any[]): Promise<boolean>;
}

export interface IUserAdminRepository {
    updateBlockStatus(id: string, isBlocked: boolean): Promise<User>;
    updateTeacherApproval(
        userId: string,
        data:
            | {
                  approvalStatus?: ApprovalStatus;
                  isApproved?: boolean;
                  rejectionReason?: string | null;
              }
            | boolean
    ): Promise<User>;
}

export interface IUserRepository
    extends Omit<
        IBaseRepository<
            User,
            string,
            CreateUserData,
            Partial<Omit<User, "id" | "createdAt">>,
            FindUsersOptions
        >,
        "create" | "count" | "delete" | "findMany" | "update"
    >,
    IUserQueryRepository,
    IUserMutationRepository,
    IUserAdminRepository {
    create(data: CreateUserData, ...args: any[]): Promise<User>;
    update(id: string, data: Partial<Omit<User, "id" | "createdAt">>): Promise<User>;
    delete(id: string, ...args: any[]): Promise<boolean>;
    findMany(options?: FindUsersOptions): Promise<PaginatedUsersResult>;
    count(where?: any): Promise<number>;
}

export type UserRepository = IUserRepository;
