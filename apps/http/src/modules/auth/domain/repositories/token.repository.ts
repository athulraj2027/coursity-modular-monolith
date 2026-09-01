export interface TokenRepository {
    saveRefreshToken(userId: string, refreshToken: string, ttlSeconds?: number): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    deleteRefreshToken(userId: string): Promise<void>;
}
