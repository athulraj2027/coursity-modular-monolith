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
    createdAt: Date;
    updatedAt: Date;
}
