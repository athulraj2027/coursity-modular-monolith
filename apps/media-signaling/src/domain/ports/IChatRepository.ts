import { ChatMessage } from "@/shared/types/ws-signaling.types";

export interface IChatRepository {
  saveMessage(message: ChatMessage): Promise<void>;
  getRecentMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  pinMessage(roomId: string, messageId: string): Promise<ChatMessage | null>;
  unpinMessage(roomId: string): Promise<void>;
  getPinnedMessage(roomId: string): Promise<ChatMessage | null>;
  deleteMessage(roomId: string, messageId: string): Promise<boolean>;
}
