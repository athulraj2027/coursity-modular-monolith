import { Role } from "@/shared/types/ws-signaling.types";

export interface ChatMessageProps {
  id?: string;
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: Role;
  message: string;
  isPinned?: boolean;
  createdAt?: string;
}

export class ChatMessageEntity {
  public readonly id: string;
  public readonly roomId: string;
  public readonly userId: string;
  public readonly displayName: string;
  public readonly avatarUrl?: string;
  public readonly role: Role;
  public readonly message: string;
  public isPinned: boolean;
  public readonly createdAt: string;

  constructor(props: ChatMessageProps) {
    this.id = props.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.roomId = props.roomId;
    this.userId = props.userId;
    this.displayName = props.displayName;
    this.avatarUrl = props.avatarUrl;
    this.role = props.role;
    this.message = props.message.trim();
    this.isPinned = Boolean(props.isPinned);
    this.createdAt = props.createdAt || new Date().toISOString();
  }

  public toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      displayName: this.displayName,
      avatarUrl: this.avatarUrl,
      role: this.role,
      message: this.message,
      isPinned: this.isPinned,
      createdAt: this.createdAt,
    };
  }
}
