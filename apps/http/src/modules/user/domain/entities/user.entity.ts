
export type UserRole =
    | "STUDENT"
    | "TEACHER"
    | "ADMIN";

export type AuthProvider =
    | "LOCAL"
    | "GOOGLE";

export type ApprovalStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "VERIFIED"
    | "REVOKED"
    | "REDO";

export interface UserTeacherProfileDetails {
    id: string;
    expertise: string[];
    qualifications: string | null;
    experienceYears: number | null;
    linkedinUrl: string | null;
    twitterUrl: string | null;
    websiteUrl: string | null;
    isApproved: boolean;
    approvalStatus: ApprovalStatus;
    rejectionReason?: string | null;
    submissionCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserProfileDetails {
    id: string;
    avatar: string | null;
    bio: string | null;
    phone: string | null;
    teacherProfile?: UserTeacherProfileDetails | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string | null;
    role: UserRole;
    authProvider: AuthProvider;
    googleId?: string | null;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile?: UserProfileDetails | null;
}




