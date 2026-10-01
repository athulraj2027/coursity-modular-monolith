import { IPollRepository } from "@/domain/ports/IPollRepository";
import { LivePoll } from "@/shared/types/ws-signaling.types";
import { ValidationError } from "@/shared/errors/AppErrors";

export class GetActivePollUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  public async execute(roomId: string, userId?: string): Promise<LivePoll | null> {
    if (!roomId) {
      throw new ValidationError("roomId is required to fetch active poll");
    }

    const activePoll = await this.pollRepository.getActivePoll(roomId);
    if (!activePoll || activePoll.status !== "ACTIVE") {
      return null;
    }

    if (userId) {
      const userVote = await this.pollRepository.getUserVote(roomId, activePoll.id, userId);
      if (userVote) {
        activePoll.userVotedOptionId = userVote;
      }
    }

    return activePoll;
  }
}
