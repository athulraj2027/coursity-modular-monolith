import Redis from "ioredis";
import { OtpRepository, StoredOtpData, TempSignupUser } from '../../domain/repositories/redis-otp.repository';
import redisClient from "@/infrastructure/redis/redis.client";

export class RedisOtpRepository implements OtpRepository {
    private readonly prefix = "otp:signup:";
    private readonly defaultTTL = 300; // 5 minutes

    constructor(private readonly redis: Redis = redisClient) { }

    private getKey(email: string): string {
        return `${this.prefix}${email.toLowerCase().trim()}`;
    }

    async saveSignupOtp(email: string, otp: string, userData: TempSignupUser, ttlSeconds: number = this.defaultTTL): Promise<void> {
        const key = this.getKey(email);
        const data: StoredOtpData = { otp, userData };
        await this.redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    }

    async getSignupOtp(email: string): Promise<StoredOtpData | null> {
        const key = this.getKey(email);
        const raw = await this.redis.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as StoredOtpData;
    }

    async deleteSignupOtp(email: string): Promise<void> {
        const key = this.getKey(email);
        await this.redis.del(key);
    }
}
