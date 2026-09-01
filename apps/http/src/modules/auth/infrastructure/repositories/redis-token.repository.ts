import Redis from "ioredis";
import { TokenRepository } from "../../domain/repositories/token.repository";
import redisClient from "@/infrastructure/redis/redis.client";

export class RedisTokenRepository implements TokenRepository {
    private readonly prefix = "auth:refresh_token:";
    private readonly defaultTTL = 7 * 24 * 60 * 60; // 7 days in seconds

    constructor(private readonly redis: Redis = redisClient) { }

    private getKey(userId: string): string {
        return `${this.prefix}${userId}`;
    }

    async saveRefreshToken(userId: string, refreshToken: string, ttlSeconds: number = this.defaultTTL): Promise<void> {
        const key = this.getKey(userId);
        await this.redis.set(key, refreshToken, "EX", ttlSeconds);
    }

    async getRefreshToken(userId: string): Promise<string | null> {
        const key = this.getKey(userId);
        return this.redis.get(key);
    }

    async deleteRefreshToken(userId: string): Promise<void> {
        const key = this.getKey(userId);
        await this.redis.del(key);
    }
}
