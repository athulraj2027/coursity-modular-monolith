import { Redis } from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info(`Connected to Redis at ${env.REDIS_URL}`);
});

redis.on("error", (err) => {
  logger.warn(`Redis connection error: ${err.message}`);
});
