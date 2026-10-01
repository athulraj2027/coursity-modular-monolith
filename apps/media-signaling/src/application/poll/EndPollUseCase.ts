import { IPollRepository } from "@/domain/ports/IPollRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { LivePoll, Role } from "@/shared/types/ws-signaling.types";
import { ForbiddenError, ValidationError, NotFoundError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS } from "@/config/constants";

export interface EndPollInput {
  roomId: string;
  pollId: string;
  userId: string;
  role: Role;
}

export class EndPollUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: EndPollInput): Promise<LivePoll> {
    const { roomId, pollId, role } = input;

    if (!roomId || !pollId) {
      throw new ValidationError("roomId and pollId are required to end a poll");
    }

    if (role !== "TEACHER" && role !== "ADMIN") {
      throw new ForbiddenError("Only teachers or admins can manually end a poll");
    }

    const endedPoll = await this.pollRepository.endPoll(roomId, pollId);
    if (!endedPoll) {
      throw new NotFoundError(`Poll ${pollId} not found in room ${roomId}`);
    }

    // Broadcast poll:ended event to all peers in the room
    await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
      type: "poll:ended",
      data: endedPoll,
    });

    return endedPoll;
  }
}
