import { IRoomRegistry } from "@/domain/ports/IRoomRegistry";
import { redis } from "./RedisClient";
import { REDIS_KEYS } from "@/config/constants";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

export class RedisRoomRegistry implements IRoomRegistry {
  public async getRoomNode(roomId: string): Promise<string | null> {
    try {
      const key = REDIS_KEYS.ROOM_ASSIGNMENT(roomId);
      const nodeId = await redis.get(key);
      return nodeId || null;
    } catch (err) {
      logger.error(`RedisRoomRegistry.getRoomNode failed for room ${roomId}:`, err);
      return null;
    }
  }

  public async assignRoomToNode(
    roomId: string,
    nodeId: string,
    ttlSeconds: number = env.ROOM_TTL_SECONDS
  ): Promise<void> {
    const key = REDIS_KEYS.ROOM_ASSIGNMENT(roomId);
    const multi = redis.multi();
    multi.set(key, nodeId, "EX", ttlSeconds);
    multi.sadd(REDIS_KEYS.ACTIVE_ROOMS, roomId);
    await multi.exec();
  }

  public async releaseRoom(roomId: string): Promise<void> {
    const key = REDIS_KEYS.ROOM_ASSIGNMENT(roomId);
    const multi = redis.multi();
    multi.del(key);
    multi.srem(REDIS_KEYS.ACTIVE_ROOMS, roomId);
    await multi.exec();
  }

  public async refreshRoomTtl(
    roomId: string,
    ttlSeconds: number = env.ROOM_TTL_SECONDS
  ): Promise<void> {
    const key = REDIS_KEYS.ROOM_ASSIGNMENT(roomId);
    await redis.expire(key, ttlSeconds);
  }

  public async getAllActiveRooms(): Promise<string[]> {
    try {
      const rooms = await redis.smembers(REDIS_KEYS.ACTIVE_ROOMS);
      return rooms || [];
    } catch (err) {
      logger.error("RedisRoomRegistry.getAllActiveRooms failed:", err);
      return [];
    }
  }
}
