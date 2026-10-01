import { LivePoll } from "@/shared/types/ws-signaling.types";

export interface IPollRepository {
  saveActivePoll(poll: LivePoll): Promise<void>;
  getActivePoll(roomId: string): Promise<LivePoll | null>;
  recordVote(
    roomId: string,
    pollId: string,
    userId: string,
    optionId: string
  ): Promise<{ poll: LivePoll; previousOptionId?: string } | null>;
  getUserVote(roomId: string, pollId: string, userId: string): Promise<string | null>;
  endPoll(roomId: string, pollId: string): Promise<LivePoll | null>;
}
