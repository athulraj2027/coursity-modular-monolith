import { CreatePollUseCase } from "@/application/poll/CreatePollUseCase";
import { VotePollUseCase } from "@/application/poll/VotePollUseCase";
import { EndPollUseCase } from "@/application/poll/EndPollUseCase";
import { GetActivePollUseCase } from "@/application/poll/GetActivePollUseCase";
import {
  CreatePollRequestData,
  VotePollRequestData,
  EndPollRequestData,
  ActivePollRequestData,
  LivePoll,
  VotePollResponseData,
  Role,
} from "@/shared/types/ws-signaling.types";
import { UnauthorizedError } from "@/shared/errors/AppErrors";

export class PollHandler {
  constructor(
    private readonly createPollUseCase: CreatePollUseCase,
    private readonly votePollUseCase: VotePollUseCase,
    private readonly endPollUseCase: EndPollUseCase,
    private readonly getActivePollUseCase: GetActivePollUseCase
  ) {}

  public async handleCreate(
    data: CreatePollRequestData,
    authContext?: { userId?: string; role?: string; displayName?: string }
  ): Promise<LivePoll> {
    if (!authContext?.userId) {
      throw new UnauthorizedError("Authentication required to create a poll");
    }

    const role = (authContext.role as Role) || "STUDENT";
    return await this.createPollUseCase.execute({
      roomId: data.roomId,
      creatorId: authContext.userId,
      creatorName: authContext.displayName || "Teacher",
      role,
      question: data.question,
      options: data.options,
      durationSeconds: data.durationSeconds,
    });
  }

  public async handleVote(
    data: VotePollRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<VotePollResponseData> {
    const userId = authContext?.userId || `guest-${Math.random().toString(36).substring(2, 8)}`;

    return await this.votePollUseCase.execute({
      roomId: data.roomId,
      pollId: data.pollId,
      userId,
      optionId: data.optionId,
    });
  }

  public async handleEnd(
    data: EndPollRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<LivePoll> {
    if (!authContext?.userId) {
      throw new UnauthorizedError("Authentication required to end a poll");
    }

    return await this.endPollUseCase.execute({
      roomId: data.roomId,
      pollId: data.pollId,
      userId: authContext.userId,
      role: (authContext.role as Role) || "STUDENT",
    });
  }

  public async handleActive(
    data: ActivePollRequestData,
    authContext?: { userId?: string }
  ): Promise<{ poll: LivePoll | null }> {
    const poll = await this.getActivePollUseCase.execute(data.roomId, authContext?.userId);
    return { poll };
  }
}
