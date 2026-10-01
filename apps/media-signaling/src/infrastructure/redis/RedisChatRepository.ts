import { IChatRepository } from "@/domain/ports/IChatRepository";
import { ChatMessage } from "@/shared/types/ws-signaling.types";
import { redis } from "./RedisClient";
import { REDIS_KEYS, CHAT_LIMITS } from "@/config/constants";
import { logger } from "@/shared/logger/Logger";

export class RedisChatRepository implements IChatRepository {
  private readonly ttlSeconds = 14400; // 4 hours

  public async saveMessage(message: ChatMessage): Promise<void> {
    try {
      const key = REDIS_KEYS.ROOM_CHAT(message.roomId);
      const serialized = JSON.stringify(message);

      // Append message and keep only the latest MAX_HISTORY_MESSAGES
      await redis
        .multi()
        .rpush(key, serialized)
        .ltrim(key, -CHAT_LIMITS.MAX_HISTORY_MESSAGES, -1)
        .expire(key, this.ttlSeconds)
        .exec();
    } catch (err) {
      logger.error(`RedisChatRepository.saveMessage failed for room ${message.roomId}:`, err);
    }
  }

  public async getRecentMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    try {
      const key = REDIS_KEYS.ROOM_CHAT(roomId);
      const effectiveLimit = Math.min(limit, CHAT_LIMITS.MAX_HISTORY_MESSAGES);
      const rawMessages = await redis.lrange(key, -effectiveLimit, -1);

      return rawMessages
        .map((raw) => {
          try {
            return JSON.parse(raw) as ChatMessage;
          } catch {
            return null;
          }
        })
        .filter((msg): msg is ChatMessage => msg !== null);
    } catch (err) {
      logger.error(`RedisChatRepository.getRecentMessages failed for room ${roomId}:`, err);
      return [];
    }
  }

  public async pinMessage(roomId: string, messageId: string): Promise<ChatMessage | null> {
    try {
      const messages = await this.getRecentMessages(roomId, CHAT_LIMITS.MAX_HISTORY_MESSAGES);
      const target = messages.find((m) => m.id === messageId);
      if (!target) return null;

      target.isPinned = true;
      const pinnedKey = REDIS_KEYS.ROOM_CHAT_PINNED(roomId);
      await redis.set(pinnedKey, JSON.stringify(target), "EX", this.ttlSeconds);

      return target;
    } catch (err) {
      logger.error(`RedisChatRepository.pinMessage failed for room ${roomId}:`, err);
      return null;
    }
  }

  public async unpinMessage(roomId: string): Promise<void> {
    try {
      const pinnedKey = REDIS_KEYS.ROOM_CHAT_PINNED(roomId);
      await redis.del(pinnedKey);
    } catch (err) {
      logger.error(`RedisChatRepository.unpinMessage failed for room ${roomId}:`, err);
    }
  }

  public async getPinnedMessage(roomId: string): Promise<ChatMessage | null> {
    try {
      const pinnedKey = REDIS_KEYS.ROOM_CHAT_PINNED(roomId);
      const raw = await redis.get(pinnedKey);
      if (!raw) return null;
      return JSON.parse(raw) as ChatMessage;
    } catch (err) {
      logger.error(`RedisChatRepository.getPinnedMessage failed for room ${roomId}:`, err);
      return null;
    }
  }

  public async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    try {
      const key = REDIS_KEYS.ROOM_CHAT(roomId);
      const messages = await this.getRecentMessages(roomId, CHAT_LIMITS.MAX_HISTORY_MESSAGES);
      const index = messages.findIndex((m) => m.id === messageId);
      if (index === -1) return false;

      // Filter out deleted message and overwrite list
      const updatedMessages = messages.filter((m) => m.id !== messageId);
      const pipeline = redis.multi();
      pipeline.del(key);
      if (updatedMessages.length > 0) {
        pipeline.rpush(key, ...updatedMessages.map((m) => JSON.stringify(m)));
        pipeline.expire(key, this.ttlSeconds);
      }
      await pipeline.exec();

      // If deleted message was pinned, clear pinned
      const pinned = await this.getPinnedMessage(roomId);
      if (pinned && pinned.id === messageId) {
        await this.unpinMessage(roomId);
      }

      return true;
    } catch (err) {
      logger.error(`RedisChatRepository.deleteMessage failed for room ${roomId}:`, err);
      return false;
    }
  }
}
