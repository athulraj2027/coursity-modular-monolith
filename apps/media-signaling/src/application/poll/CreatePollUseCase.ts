import { IPollRepository } from "@/domain/ports/IPollRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { LivePollEntity } from "@/domain/entities/LivePoll";
import { LivePoll, Role } from "@/shared/types/ws-signaling.types";
import { ForbiddenError, ValidationError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS, POLL_LIMITS } from "@/config/constants";

export interface CreatePollInput {
  roomId: string;
  creatorId: string;
  creatorName: string;
  role: Role;
  question: string;
  options: string[] | Array<{ id?: string; text: string }>;
  durationSeconds?: number;
}

export class CreatePollUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: CreatePollInput): Promise<LivePoll> {
    const { roomId, creatorId, creatorName, role, question, options, durationSeconds } = input;

    if (!roomId) {
      throw new ValidationError("roomId is required to create a poll");
    }

    if (role !== "TEACHER" && role !== "ADMIN") {
      throw new ForbiddenError("Only teachers or admins can create live polls");
    }

    if (!question || question.trim().length === 0) {
      throw new ValidationError("Poll question cannot be empty");
    }

    if (question.length > POLL_LIMITS.MAX_QUESTION_LENGTH) {
      throw new ValidationError(
        `Poll question cannot exceed ${POLL_LIMITS.MAX_QUESTION_LENGTH} characters`
      );
    }

    if (!Array.isArray(options) || options.length < POLL_LIMITS.MIN_OPTIONS) {
      throw new ValidationError(
        `A poll must have at least ${POLL_LIMITS.MIN_OPTIONS} options`
      );
    }

    if (options.length > POLL_LIMITS.MAX_OPTIONS) {
      throw new ValidationError(
        `A poll cannot have more than ${POLL_LIMITS.MAX_OPTIONS} options`
      );
    }

    const parsedOptions = options.map((opt, i) => {
      const text = typeof opt === "string" ? opt : opt.text;
      if (!text || text.trim().length === 0) {
        throw new ValidationError(`Option ${i + 1} cannot be empty`);
      }
      return {
        id: typeof opt === "object" && opt.id ? opt.id : `opt-${i + 1}`,
        text: text.trim(),
        voteCount: 0,
        percentage: 0,
      };
    });

    // Check if previous active poll exists and auto-end it
    const existingActive = await this.pollRepository.getActivePoll(roomId);
    if (existingActive && existingActive.status === "ACTIVE") {
      await this.pollRepository.endPoll(roomId, existingActive.id);
      await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
        type: "poll:ended",
        data: {
          roomId,
          pollId: existingActive.id,
          reason: "superseded_by_new_poll",
        },
      });
    }

    const pollEntity = new LivePollEntity({
      roomId,
      creatorId,
      creatorName: creatorName || "Teacher",
      question,
      options: parsedOptions,
      durationSeconds: durationSeconds || POLL_LIMITS.DEFAULT_DURATION_SECONDS,
    });

    const createdPoll = pollEntity.toJSON();

    // 1. Save in Redis Poll Repository
    await this.pollRepository.saveActivePoll(createdPoll);

    // 2. Broadcast poll:created event via Redis PubSub
    await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
      type: "poll:created",
      data: createdPoll,
    });

    return createdPoll;
  }
}
