/**
 * Interface Segregation: Token saving operations
 */
export interface ISaveRefreshTokenRepository {
    saveRefreshToken(userId: string, refreshToken: string, ttlSeconds?: number): Promise<void>;
}

/**
 * Interface Segregation: Token retrieval operations
 */
export interface IGetRefreshTokenRepository {
    getRefreshToken(userId: string): Promise<string | null>;
}

/**
 * Interface Segregation: Token revocation operations
 */
export interface IDeleteRefreshTokenRepository {
    deleteRefreshToken(userId: string): Promise<void>;
}

/**
 * Unified Token repository contract extending all segregated interfaces
 */
export interface ITokenRepository
    extends ISaveRefreshTokenRepository,
        IGetRefreshTokenRepository,
        IDeleteRefreshTokenRepository {}

// Backward-compatibility alias
export type TokenRepository = ITokenRepository;
