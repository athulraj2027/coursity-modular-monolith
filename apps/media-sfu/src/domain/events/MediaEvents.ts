import type { MediaKind } from "mediasoup/node/lib/types";
import type { Role } from "@/shared/types/ws-protocol.types";

export interface ParticipantJoinedEvent {
  roomId: string;
  userId: string;
  role: Role;
  displayName: string;
  joinedAt: Date;
}

export interface ParticipantLeftEvent {
  roomId: string;
  userId: string;
  leftAt: Date;
}

export interface ProducerStartedEvent {
  roomId: string;
  producerId: string;
  userId: string;
  kind: MediaKind;
  appData?: Record<string, unknown>;
}

export interface ProducerClosedEvent {
  roomId: string;
  producerId: string;
  userId: string;
}

export interface SessionTerminatedEvent {
  roomId: string;
  reason: string;
  terminatedAt: Date;
}
