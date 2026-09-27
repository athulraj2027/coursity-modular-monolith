import { Redis } from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

class RedisConnectionManager {
  private client: Redis | null = null;
  private subscriber: Redis | null = null;

  public getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 500, 5000);
          logger.warn(`Redis disconnected. Reconnecting in ${delay}ms... (attempt ${times})`);
          return delay;
        },
      });

      this.client.on("connect", () => {
        logger.info("Connected to Redis Coordination Cluster");
      });

      this.client.on("ready", () => {
        logger.success("Redis client is ready for commands");
      });

      this.client.on("error", (err) => {
        logger.error("Redis client error:", err.message);
      });
    }

    return this.client;
  }

  public getSubscriber(): Redis {
    if (!this.subscriber) {
      this.subscriber = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy: (times) => {
          const delay = Math.min(times * 500, 5000);
          return delay;
        },
      });

      this.subscriber.on("connect", () => {
        logger.info("Connected to Redis PubSub subscriber channel");
      });

      this.subscriber.on("error", (err) => {
        logger.error("Redis subscriber error:", err.message);
      });
    }

    return this.subscriber;
  }

  public async connect(): Promise<void> {
    const client = this.getClient();
    if (client.status === "wait") {
      await client.connect();
    }
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
    logger.info("Closed Redis connections");
  }
}

export const redisManager = new RedisConnectionManager();
export const redis = redisManager.getClient();
