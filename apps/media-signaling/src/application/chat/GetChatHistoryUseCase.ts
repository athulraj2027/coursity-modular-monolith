import { IChatRepository } from "@/domain/ports/IChatRepository";
import { ChatHistoryResponseData } from "@/shared/types/ws-signaling.types";
import { ValidationError } from "@/shared/errors/AppErrors";

export class GetChatHistoryUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  public async execute(roomId: string, limit = 50): Promise<ChatHistoryResponseData> {
    if (!roomId) {
      throw new ValidationError("roomId is required to fetch chat history");
    }

    const [messages, pinnedMessage] = await Promise.all([
      this.chatRepository.getRecentMessages(roomId, limit),
      this.chatRepository.getPinnedMessage(roomId),
    ]);

    return {
      messages,
      pinnedMessage,
    };
  }
}
