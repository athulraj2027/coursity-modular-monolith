export interface UpdateProfileDTO {
    name?: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    headline?: string | null;
    // Student fields
    education?: string | null;
    interests?: string[];
    // Teacher fields
    expertise?: string[];
    qualifications?: string | null;
    experienceYears?: number | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
}
