import { StudentProfile } from "./student-profile.entity";
import { TeacherProfile } from "./teacher-profile.entity";
import { UserRole, AuthProvider } from "@/modules/user/domain/entities/user.entity";

export * from "./student-profile.entity";
export * from "./teacher-profile.entity";

export interface FullUserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    authProvider: AuthProvider;
    isBlocked: boolean;
    studentProfile?: StudentProfile | null;
    teacherProfile?: TeacherProfile | null;
    createdAt: Date;
    updatedAt: Date;
}

