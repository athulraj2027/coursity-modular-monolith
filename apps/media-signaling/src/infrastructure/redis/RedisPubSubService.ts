import { IPubSubService } from "@/domain/ports/IPubSubService";
import { redis, redisManager } from "./RedisClient";
import { logger } from "@/shared/logger/Logger";

export class RedisPubSubService implements IPubSubService {
  private readonly subscriber = redisManager.getSubscriber();
  private readonly handlers = new Map<string, Set<(message: unknown) => void>>();
  private isListening = false;

  public async publish<T = unknown>(channel: string, message: T): Promise<void> {
    try {
      const serialized = typeof message === "string" ? message : JSON.stringify(message);
      await redis.publish(channel, serialized);
    } catch (err) {
      logger.error(`Failed to publish message to channel ${channel}:`, err);
    }
  }

  public async subscribe<T = unknown>(
    channel: string,
    handler: (message: T) => void
  ): Promise<() => void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }

    const set = this.handlers.get(channel)!;
    const castHandler = handler as (message: unknown) => void;
    set.add(castHandler);

    if (!this.isListening) {
      this.isListening = true;
      this.subscriber.on("message", (msgChannel, rawMessage) => {
        const channelHandlers = this.handlers.get(msgChannel);
        if (channelHandlers && channelHandlers.size > 0) {
          try {
            const parsed = JSON.parse(rawMessage);
            for (const fn of channelHandlers) {
              fn(parsed);
            }
          } catch {
            for (const fn of channelHandlers) {
              fn(rawMessage);
            }
          }
        }
      });
    }

    return () => {
      set.delete(castHandler);
      if (set.size === 0) {
        this.handlers.delete(channel);
        this.subscriber.unsubscribe(channel).catch((err) => {
          logger.warn(`Failed to unsubscribe from channel ${channel}:`, err);
        });
      }
    };
  }
}
