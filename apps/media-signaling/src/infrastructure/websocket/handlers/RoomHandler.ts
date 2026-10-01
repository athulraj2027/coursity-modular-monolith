import { IPubSubService } from "@/domain/ports/IPubSubService";
import { GetChatHistoryUseCase } from "@/application/chat/GetChatHistoryUseCase";
import { GetActivePollUseCase } from "@/application/poll/GetActivePollUseCase";
import {
  RoomEnterRequestData,
  RoomReactionRequestData,
  ChatMessage,
  LivePoll,
  Role,
} from "@/shared/types/ws-signaling.types";
import { REDIS_KEYS } from "@/config/constants";

export interface RoomInitialState {
  roomId: string;
  chatHistory: ChatMessage[];
  pinnedComment: ChatMessage | null;
  activePoll: LivePoll | null;
}

export class RoomHandler {
  constructor(
    private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
    private readonly getActivePollUseCase: GetActivePollUseCase,
    private readonly pubSubService: IPubSubService
  ) {}

  public async handleEnter(
    data: RoomEnterRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<RoomInitialState> {
    const [history, activePoll] = await Promise.all([
      this.getChatHistoryUseCase.execute(data.roomId, 50),
      this.getActivePollUseCase.execute(data.roomId, authContext?.userId),
    ]);

    return {
      roomId: data.roomId,
      chatHistory: history.messages,
      pinnedComment: history.pinnedMessage,
      activePoll,
    };
  }

  public async handleReaction(
    data: RoomReactionRequestData,
    authContext?: { userId?: string; displayName?: string; role?: string }
  ): Promise<{ success: boolean }> {
    const userId = authContext?.userId || `guest-${Math.random().toString(36).substring(2, 8)}`;
    const displayName = authContext?.displayName || "Viewer";

    await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(data.roomId), {
      type: "room:reaction",
      data: {
        roomId: data.roomId,
        userId,
        displayName,
        reaction: data.reaction,
        timestamp: Date.now(),
      },
    });

    return { success: true };
  }
}
