export interface UserProfile {
    id: string;
    userId: string;
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
