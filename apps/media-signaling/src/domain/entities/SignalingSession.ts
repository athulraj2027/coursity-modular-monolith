import { Role } from "@/shared/types/ws-signaling.types";

export interface ParticipantPermissions {
  canProduceAudio: boolean;
  canProduceVideo: boolean;
  canProduceScreen: boolean;
  canConsume: boolean;
}

export interface SignalingSession {
  connectionId: string;
  userId: string;
  classSessionId?: string;
  role: Role;
  displayName?: string;
  permissions: ParticipantPermissions;
  connectedAt: number;
}
