import type { QualificationItem } from "../entities/teacher-profile.entity";

export interface UpdateProfileDTO {
    name?: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    country?: string | null;
    expertise?: string[];
    qualifications?: QualificationItem[] | string | null;
    experienceYears?: number | null;
    resume?: string | null;
    credentials?: string[];
    identityCard?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
}
