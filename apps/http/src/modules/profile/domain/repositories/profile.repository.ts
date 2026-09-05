import { FullUserProfile } from "../entities/profile.entity";
import { StudentProfile } from "../entities/student-profile.entity";
import { TeacherProfile } from "../entities/teacher-profile.entity";

export interface ProfileRepository {

    getFullProfileByUserId(userId: string): Promise<FullUserProfile | null>;
    getStudentProfile(userId: string): Promise<StudentProfile | null>;
    getTeacherProfile(userId: string): Promise<TeacherProfile | null>;
    upsertStudentProfile(
        userId: string,
        data: Partial<Omit<StudentProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<StudentProfile>;
    upsertTeacherProfile(
        userId: string,
        data: Partial<Omit<TeacherProfile, "id" | "userId" | "createdAt" | "updatedAt">>
    ): Promise<TeacherProfile>;
    updateUserName(userId: string, name: string): Promise<void>;
}
