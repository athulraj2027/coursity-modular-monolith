export interface UpdateStudentProfileDTO {
    name?: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    headline?: string | null;
    education?: string | null;
    interests?: string[];
}
