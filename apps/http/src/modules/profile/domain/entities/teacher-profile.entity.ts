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
    resume?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
    isApproved: boolean;
    approvalStatus: ApprovalStatus;
    rejectionReason?: string | null;
    submissionCount?: number;
    isInterviewPassed: boolean;
    interviewScore?: number | null;
    interviewFeedback?: string | null;
    interviewAttempts?: number;
    lastInterviewAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
