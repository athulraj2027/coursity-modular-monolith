import { IBaseRepository } from "@/shared/domain/repositories/base.repository.interface";
import { FullUserProfile, UserProfile, TeacherProfile } from "../entities/profile.entity";

export interface ProfileRepository extends IBaseRepository<UserProfile, string> {
    getFullProfileByUserId(userId: string): Promise<FullUserProfile | null>;
    getProfileByUserId(userId: string): Promise<UserProfile | null>;
    getTeacherProfileByProfileId(profileId: string): Promise<TeacherProfile | null>;
    upsertProfile(
        userId: string,
        data: Partial<Omit<UserProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<UserProfile>;
    upsertTeacherProfile(
        profileId: string,
        data: Partial<Omit<TeacherProfile, "id" | "profileId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile>;
    updateUserName(userId: string, name: string): Promise<void>;
    getOrCreateTeacherProfileId(userId: string): Promise<string>;
    getTeacherProfileIdByUserId(userId: string): Promise<string | null>;
}
