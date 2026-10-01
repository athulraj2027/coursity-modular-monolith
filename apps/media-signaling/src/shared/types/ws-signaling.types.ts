export type Role = "TEACHER" | "STUDENT" | "ADMIN" | "GUEST";

export type ClientMessageType =
  | "session:join"
  | "session:allocate"
  | "room:query"
  | "room:enter"
  | "room:leave"
  | "room:reaction"
  | "chat:send"
  | "chat:history"
  | "chat:pin"
  | "chat:delete"
  | "poll:create"
  | "poll:vote"
  | "poll:end"
  | "poll:active"
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

// ==================== Live Signaling Types ====================

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

// ==================== Room Subscription Types ====================

export interface RoomEnterRequestData {
  roomId: string;
  token?: string;
  displayName?: string;
}

export interface RoomReactionRequestData {
  roomId: string;
  reaction: "like" | "heart" | "clap" | "fire" | "bulb" | string;
}

// ==================== Live Chat / Comments Types ====================

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: Role;
  message: string;
  isPinned: boolean;
  createdAt: string;
}

export interface SendCommentRequestData {
  roomId: string;
  message: string;
  displayName?: string;
  avatarUrl?: string;
  pinned?: boolean;
}

export interface PinCommentRequestData {
  roomId: string;
  commentId: string;
  pinned: boolean;
}

export interface DeleteCommentRequestData {
  roomId: string;
  commentId: string;
}

export interface ChatHistoryRequestData {
  roomId: string;
  limit?: number;
}

export interface ChatHistoryResponseData {
  messages: ChatMessage[];
  pinnedMessage: ChatMessage | null;
}

// ==================== Interactive Live Poll Types ====================

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface LivePoll {
  id: string;
  roomId: string;
  creatorId: string;
  creatorName: string;
  question: string;
  options: PollOption[];
  status: "ACTIVE" | "ENDED";
  totalVotes: number;
  durationSeconds?: number;
  createdAt: string;
  expiresAt?: string;
  userVotedOptionId?: string;
}

export interface CreatePollRequestData {
  roomId: string;
  question: string;
  options: string[] | Array<{ id?: string; text: string }>;
  durationSeconds?: number;
}

export interface VotePollRequestData {
  roomId: string;
  pollId: string;
  optionId: string;
}

export interface EndPollRequestData {
  roomId: string;
  pollId: string;
}

export interface ActivePollRequestData {
  roomId: string;
}

export interface VotePollResponseData {
  success: boolean;
  pollId: string;
  optionId: string;
  results: LivePoll;
}
