import { IChatRepository } from "@/domain/ports/IChatRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { ChatMessageEntity } from "@/domain/entities/ChatMessage";
import { ChatMessage, Role } from "@/shared/types/ws-signaling.types";
import { ValidationError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS, CHAT_LIMITS } from "@/config/constants";

export interface SendCommentInput {
  roomId: string;
  userId: string;
  displayName: string;
  role: Role;
  message: string;
  avatarUrl?: string;
  pinned?: boolean;
}

export class SendCommentUseCase {
  private readonly lastSentByUser = new Map<string, number>();

  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: SendCommentInput): Promise<ChatMessage> {
    const { roomId, userId, displayName, role, message, avatarUrl, pinned } = input;

    if (!roomId) {
      throw new ValidationError("roomId is required to post a comment");
    }

    if (!message || message.trim().length === 0) {
      throw new ValidationError("Comment message cannot be empty");
    }

    if (message.length > CHAT_LIMITS.MAX_MESSAGE_LENGTH) {
      throw new ValidationError(
        `Comment message exceeds maximum length of ${CHAT_LIMITS.MAX_MESSAGE_LENGTH} characters`
      );
    }

    // Rate limiting check (e.g. max 1 msg every 800ms per user)
    const now = Date.now();
    const lastSent = this.lastSentByUser.get(userId) || 0;
    if (now - lastSent < CHAT_LIMITS.RATE_LIMIT_MS && role === "STUDENT") {
      throw new ValidationError("Please wait a moment before sending another message");
    }
    this.lastSentByUser.set(userId, now);

    const isPinned = Boolean(pinned) && (role === "TEACHER" || role === "ADMIN");

    const entity = new ChatMessageEntity({
      roomId,
      userId,
      displayName: displayName || (role === "TEACHER" ? "Teacher" : "Student"),
      role,
      message,
      avatarUrl,
      isPinned,
    });

    const chatMsg = entity.toJSON();

    // 1. Save to Redis repository
    await this.chatRepository.saveMessage(chatMsg);

    // If teacher pinned the message, save pinned state
    if (isPinned) {
      await this.chatRepository.pinMessage(roomId, chatMsg.id);
    }

    // 2. Broadcast to room events channel
    await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
      type: "chat:message",
      data: chatMsg,
    });

    return chatMsg;
  }
}
