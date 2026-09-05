export interface UpdateTeacherProfileDTO {
    name?: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    headline?: string | null;
    expertise?: string[];
    qualifications?: string | null;
    experienceYears?: number | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
}
