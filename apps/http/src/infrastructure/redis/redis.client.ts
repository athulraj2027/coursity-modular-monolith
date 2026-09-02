import Redis from "ioredis";
import { env } from "@/app/config/env";

export const redis = new Redis(env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 5) {
            console.warn("⚠️ Redis retry limit exceeded (5 attempts). Halting auto-reconnect.");
            return null;
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
});

redis.on("connect", () => {
    console.log("📦 Redis client connected");
});

redis.on("ready", () => {
    console.log("⚡ Redis client ready");
});

redis.on("error", (err: any) => {
    console.error("❌ Redis connection error:", err?.message || err || "Unknown error");
});

redis.on("close", () => {
    console.log("🔌 Redis connection closed");
});

export default redis;
