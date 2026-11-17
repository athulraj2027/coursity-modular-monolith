import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import { FullUserProfile, UserProfile, TeacherProfile } from "../entities/profile.entity";

export interface IProfileQueryRepository {
    getFullProfileByUserId(userId: string): Promise<FullUserProfile | null>;
    getProfileByUserId(userId: string): Promise<UserProfile | null>;
    getTeacherProfileByProfileId(profileId: string): Promise<TeacherProfile | null>;
    getTeacherProfileIdByUserId(userId: string): Promise<string | null>;
}

export interface IProfileMutationRepository {
    upsertProfile(
        userId: string,
        data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<UserProfile>;
    updateUserName(userId: string, name: string): Promise<void>;
}

export interface ITeacherProfileMutationRepository {
    upsertTeacherProfile(
        profileId: string,
        data: Partial<Omit<TeacherProfile, "id" | "profileId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile>;
    getOrCreateTeacherProfileId(userId: string): Promise<string>;
}

export interface IUserPasswordRepository {
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        authProvider: string;
        password?: string | null;
    } | null>;
    updatePassword(id: string, passwordHash: string): Promise<any>;
}

export interface IProfileRepository
    extends IBaseRepository<UserProfile, string>,
        IProfileQueryRepository,
        IProfileMutationRepository,
        ITeacherProfileMutationRepository {}

export type ProfileRepository = IProfileRepository;
