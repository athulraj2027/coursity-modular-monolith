export type Role = "TEACHER" | "STUDENT" | "ADMIN" | "GUEST";

export type ClientMessageType =
  | "session:join"
  | "session:allocate"
  | "room:query"
  | "ping";

export interface WsRequest<T = unknown> {
  id: string; // Correlation ID for request-response pairing
  type: ClientMessageType;
  data: T;
}

export interface WsResponse<T = unknown> {
  id: string;
  type: "response";
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface WsNotification<T = unknown> {
  type: string;
  data: T;
}

export interface JoinSessionRequestData {
  classSessionId: string;
  token?: string;
  role?: Role;
  displayName?: string;
}

export interface AllocateRoomRequestData {
  classSessionId: string;
  region?: string;
}

export interface RoomQueryRequestData {
  classSessionId: string;
}

export interface JoinTicketPayload {
  userId: string;
  classSessionId: string;
  role: Role;
  displayName?: string;
  canProduceAudio: boolean;
  canProduceVideo: boolean;
  canProduceScreen: boolean;
  canConsume: boolean;
  assignedNodeId: string;
  exp: number;
}

export interface JoinSessionResponseData {
  classSessionId: string;
  nodeId: string;
  wsUrl: string;
  httpUrl: string;
  joinToken: string;
  role: Role;
  expiresIn: number;
}

export interface AllocateRoomResponseData {
  classSessionId: string;
  nodeId: string;
  wsUrl: string;
  httpUrl: string;
  isNewAllocation: boolean;
}

export interface RoomQueryResponseData {
  classSessionId: string;
  allocated: boolean;
  nodeId?: string;
  wsUrl?: string;
  httpUrl?: string;
}
