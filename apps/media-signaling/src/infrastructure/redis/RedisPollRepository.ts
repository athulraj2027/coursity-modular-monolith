import { IPollRepository } from "@/domain/ports/IPollRepository";
import { LivePoll } from "@/shared/types/ws-signaling.types";
import { LivePollEntity } from "@/domain/entities/LivePoll";
import { redis } from "./RedisClient";
import { REDIS_KEYS } from "@/config/constants";
import { logger } from "@/shared/logger/Logger";

export class RedisPollRepository implements IPollRepository {
  private readonly ttlSeconds = 14400; // 4 hours

  public async saveActivePoll(poll: LivePoll): Promise<void> {
    try {
      const key = REDIS_KEYS.ROOM_POLL_ACTIVE(poll.roomId);
      await redis.set(key, JSON.stringify(poll), "EX", this.ttlSeconds);
    } catch (err) {
      logger.error(`RedisPollRepository.saveActivePoll failed for room ${poll.roomId}:`, err);
    }
  }

  public async getActivePoll(roomId: string): Promise<LivePoll | null> {
    try {
      const key = REDIS_KEYS.ROOM_POLL_ACTIVE(roomId);
      const raw = await redis.get(key);
      if (!raw) return null;

      const data = JSON.parse(raw) as LivePoll;
      const entity = new LivePollEntity(data);

      // Check auto-expiration
      if (entity.isExpired() && entity.status === "ACTIVE") {
        entity.status = "ENDED";
        await this.saveActivePoll(entity.toJSON());
      }

      return entity.toJSON();
    } catch (err) {
      logger.error(`RedisPollRepository.getActivePoll failed for room ${roomId}:`, err);
      return null;
    }
  }

  public async recordVote(
    roomId: string,
    pollId: string,
    userId: string,
    optionId: string
  ): Promise<{ poll: LivePoll; previousOptionId?: string } | null> {
    try {
      const activePoll = await this.getActivePoll(roomId);
      if (!activePoll || activePoll.id !== pollId || activePoll.status !== "ACTIVE") {
        return null;
      }

      const entity = new LivePollEntity(activePoll);
      if (entity.isExpired()) {
        entity.status = "ENDED";
        await this.saveActivePoll(entity.toJSON());
        return null;
      }

      const targetOption = entity.options.find((opt) => opt.id === optionId);
      if (!targetOption) {
        return null;
      }

      const votesKey = REDIS_KEYS.ROOM_POLL_VOTES(roomId, pollId);
      const previousVote = await redis.hget(votesKey, userId);

      // If user voted previously, adjust option counts
      if (previousVote) {
        const prevOption = entity.options.find((opt) => opt.id === previousVote);
        if (prevOption && prevOption.voteCount > 0) {
          prevOption.voteCount -= 1;
        }
      }

      // Increment new vote
      targetOption.voteCount += 1;
      await redis.hset(votesKey, userId, optionId);
      await redis.expire(votesKey, this.ttlSeconds);

      // Recalculate percentages & save
      entity.recalculatePercentages();
      const updatedPoll = entity.toJSON();
      await this.saveActivePoll(updatedPoll);

      return {
        poll: updatedPoll,
        previousOptionId: previousVote || undefined,
      };
    } catch (err) {
      logger.error(`RedisPollRepository.recordVote failed for room ${roomId}, poll ${pollId}:`, err);
      return null;
    }
  }

  public async getUserVote(roomId: string, pollId: string, userId: string): Promise<string | null> {
    try {
      const votesKey = REDIS_KEYS.ROOM_POLL_VOTES(roomId, pollId);
      return await redis.hget(votesKey, userId);
    } catch (err) {
      logger.error(`RedisPollRepository.getUserVote failed for room ${roomId}, poll ${pollId}:`, err);
      return null;
    }
  }

  public async endPoll(roomId: string, pollId: string): Promise<LivePoll | null> {
    try {
      const activePoll = await this.getActivePoll(roomId);
      if (!activePoll || activePoll.id !== pollId) {
        return null;
      }

      const entity = new LivePollEntity(activePoll);
      entity.status = "ENDED";
      const endedPoll = entity.toJSON();

      await this.saveActivePoll(endedPoll);
      return endedPoll;
    } catch (err) {
      logger.error(`RedisPollRepository.endPoll failed for room ${roomId}, poll ${pollId}:`, err);
      return null;
    }
  }
}
