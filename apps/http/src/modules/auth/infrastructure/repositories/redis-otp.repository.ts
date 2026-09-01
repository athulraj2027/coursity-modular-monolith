import Redis from "ioredis";
import { OtpRepository, StoredOtpData, StoredResetPasswordOtpData, TempSignupUser } from '../../domain/repositories/redis-otp.repository';
import redisClient from "@/infrastructure/redis/redis.client";

export class RedisOtpRepository implements OtpRepository {
    private readonly signupPrefix = "otp:signup:";
    private readonly resetPasswordPrefix = "otp:reset-password:";
    private readonly defaultTTL = 300; // 5 minutes

    constructor(private readonly redis: Redis = redisClient) { }

    private getSignupKey(email: string): string {
        return `${this.signupPrefix}${email.toLowerCase().trim()}`;
    }

    private getResetPasswordKey(email: string): string {
        return `${this.resetPasswordPrefix}${email.toLowerCase().trim()}`;
    }

    async saveSignupOtp(email: string, otp: string, userData: TempSignupUser, ttlSeconds: number = this.defaultTTL): Promise<void> {
        const key = this.getSignupKey(email);
        const data: StoredOtpData = {
            otp,
            userData,
            createdAt: Date.now(),
        };
        await this.redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    }

    async getSignupOtp(email: string): Promise<StoredOtpData | null> {
        const key = this.getSignupKey(email);
        const raw = await this.redis.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as StoredOtpData;
    }

    async deleteSignupOtp(email: string): Promise<void> {
        const key = this.getSignupKey(email);
        await this.redis.del(key);
    }

    async saveResetPasswordOtp(email: string, otp: string, ttlSeconds: number = this.defaultTTL): Promise<void> {
        const key = this.getResetPasswordKey(email);
        const data: StoredResetPasswordOtpData = {
            otp,
            email: email.toLowerCase().trim(),
            createdAt: Date.now(),
        };
        await this.redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    }

    async getResetPasswordOtp(email: string): Promise<StoredResetPasswordOtpData | null> {
        const key = this.getResetPasswordKey(email);
        const raw = await this.redis.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as StoredResetPasswordOtpData;
    }

    async deleteResetPasswordOtp(email: string): Promise<void> {
        const key = this.getResetPasswordKey(email);
        await this.redis.del(key);
    }
}
