import { SendCommentUseCase } from "@/application/chat/SendCommentUseCase";
import { GetChatHistoryUseCase } from "@/application/chat/GetChatHistoryUseCase";
import { PinCommentUseCase } from "@/application/chat/PinCommentUseCase";
import { DeleteCommentUseCase } from "@/application/chat/DeleteCommentUseCase";
import {
  SendCommentRequestData,
  PinCommentRequestData,
  DeleteCommentRequestData,
  ChatHistoryRequestData,
  ChatMessage,
  ChatHistoryResponseData,
  Role,
} from "@/shared/types/ws-signaling.types";
import { UnauthorizedError } from "@/shared/errors/AppErrors";

export class ChatHandler {
  constructor(
    private readonly sendCommentUseCase: SendCommentUseCase,
    private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
    private readonly pinCommentUseCase: PinCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase
  ) {}

  public async handleSend(
    data: SendCommentRequestData,
    authContext?: { userId?: string; role?: string; displayName?: string }
  ): Promise<ChatMessage> {
    const userId = authContext?.userId || `guest-${Math.random().toString(36).substring(2, 8)}`;
    const role = (authContext?.role as Role) || "STUDENT";
    const displayName = data.displayName || authContext?.displayName || (role === "TEACHER" ? "Teacher" : "Student");

    return await this.sendCommentUseCase.execute({
      roomId: data.roomId,
      userId,
      displayName,
      role,
      message: data.message,
      avatarUrl: data.avatarUrl,
      pinned: data.pinned,
    });
  }

  public async handleHistory(data: ChatHistoryRequestData): Promise<ChatHistoryResponseData> {
    return await this.getChatHistoryUseCase.execute(data.roomId, data.limit);
  }

  public async handlePin(
    data: PinCommentRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<ChatMessage | null> {
    if (!authContext?.userId) {
      throw new UnauthorizedError("Authentication required to pin comments");
    }

    return await this.pinCommentUseCase.execute({
      roomId: data.roomId,
      commentId: data.commentId,
      pinned: data.pinned,
      userId: authContext.userId,
      role: (authContext.role as Role) || "STUDENT",
    });
  }

  public async handleDelete(
    data: DeleteCommentRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<{ success: boolean; commentId: string }> {
    if (!authContext?.userId) {
      throw new UnauthorizedError("Authentication required to delete comments");
    }

    const success = await this.deleteCommentUseCase.execute({
      roomId: data.roomId,
      commentId: data.commentId,
      userId: authContext.userId,
      role: (authContext.role as Role) || "STUDENT",
    });

    return { success, commentId: data.commentId };
  }
}
