import { IChatRepository } from "@/domain/ports/IChatRepository";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { Role } from "@/shared/types/ws-signaling.types";
import { ForbiddenError, ValidationError } from "@/shared/errors/AppErrors";
import { REDIS_KEYS } from "@/config/constants";

export interface DeleteCommentInput {
  roomId: string;
  commentId: string;
  userId: string;
  role: Role;
}

export class DeleteCommentUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(input: DeleteCommentInput): Promise<boolean> {
    const { roomId, commentId, userId, role } = input;

    if (!roomId || !commentId) {
      throw new ValidationError("roomId and commentId are required");
    }

    // Only teachers, admins, or the original message author can delete
    if (role !== "TEACHER" && role !== "ADMIN") {
      const messages = await this.chatRepository.getRecentMessages(roomId, 100);
      const target = messages.find((m) => m.id === commentId);
      if (target && target.userId !== userId) {
        throw new ForbiddenError("You can only delete your own comments");
      }
    }

    const success = await this.chatRepository.deleteMessage(roomId, commentId);
    if (success) {
      await this.pubSubService.publish(REDIS_KEYS.ROOM_EVENTS_CHANNEL(roomId), {
        type: "chat:deleted",
        data: {
          roomId,
          commentId,
          deletedBy: userId,
        },
      });
    }

    return success;
  }
}
