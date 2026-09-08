export type ApprovalStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "VERIFIED"
    | "REVOKED"
    | "REDO";

export interface TeacherProfile {
    id: string;
    profileId: string;
    expertise: string[];
    qualifications?: string | null;
    experienceYears?: number | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
    isApproved: boolean;
    approvalStatus: ApprovalStatus;
    rejectionReason?: string | null;
    submissionCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
