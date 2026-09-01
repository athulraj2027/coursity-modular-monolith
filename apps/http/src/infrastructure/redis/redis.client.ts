import Redis from "ioredis";
import { env } from "@/app/config/env";

export const redis = new Redis(env.REDIS_URL || "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
});

export default redis;
