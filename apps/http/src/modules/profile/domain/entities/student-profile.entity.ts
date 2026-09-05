export interface StudentProfile {
    id: string;
    userId: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    headline?: string | null;
    education?: string | null;
    interests: string[];
    createdAt: Date;
    updatedAt: Date;
}
