import { IPollRepository } from "@/domain/ports/IPollRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { VotePollResponseData } from "@/shared/types/ws-signaling.types";
import { ValidationError, NotFoundError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS } from "@/config/constants";

export interface VotePollInput {
  roomId: string;
  pollId: string;
  userId: string;
  optionId: string;
}

export class VotePollUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: VotePollInput): Promise<VotePollResponseData> {
    const { roomId, pollId, userId, optionId } = input;

    if (!roomId || !pollId || !optionId) {
      throw new ValidationError("roomId, pollId, and optionId are required to vote");
    }

    const result = await this.pollRepository.recordVote(roomId, pollId, userId, optionId);
    if (!result) {
      throw new NotFoundError(
        "Active poll was not found, has expired, or the selected option is invalid"
      );
    }

    // Broadcast live poll update to all peers in the room
    await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
      type: "poll:updated",
      data: result.poll,
    });

    return {
      success: true,
      pollId,
      optionId,
      results: result.poll,
    };
  }
}
