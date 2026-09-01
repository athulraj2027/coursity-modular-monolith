import Redis from "ioredis";
import { env } from "@/app/config/env";

export const redis = new Redis(env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
    },
});

redis.on("connect", () => {
    console.log("📦 Redis client connected");
});

redis.on("ready", () => {
    console.log("⚡ Redis client ready");
});

redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
});

redis.on("close", () => {
    console.log("🔌 Redis connection closed");
});

export default redis;
