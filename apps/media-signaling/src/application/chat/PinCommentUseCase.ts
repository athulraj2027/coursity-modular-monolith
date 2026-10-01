import { IChatRepository } from "@/domain/ports/IChatRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { ChatMessage, Role } from "@/shared/types/ws-signaling.types";
import { ForbiddenError, ValidationError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS } from "@/config/constants";

export interface PinCommentInput {
  roomId: string;
  commentId: string;
  pinned: boolean;
  userId: string;
  role: Role;
}

export class PinCommentUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: PinCommentInput): Promise<ChatMessage | null> {
    const { roomId, commentId, pinned, role } = input;

    if (!roomId || !commentId) {
      throw new ValidationError("roomId and commentId are required");
    }

    if (role !== "TEACHER" && role !== "ADMIN") {
      throw new ForbiddenError("Only teachers or admins can pin or unpin comments");
    }

    let pinnedMsg: ChatMessage | null = null;
    if (pinned) {
      pinnedMsg = await this.chatRepository.pinMessage(roomId, commentId);
      if (pinnedMsg) {
        await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
          type: "chat:pinned",
          data: {
            roomId,
            commentId,
            message: pinnedMsg,
          },
        });
      }
    } else {
      await this.chatRepository.unpinMessage(roomId);
      await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
        type: "chat:unpinned",
        data: {
          roomId,
          commentId,
        },
      });
    }

    return pinnedMsg;
  }
}
