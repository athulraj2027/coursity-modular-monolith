export const REDIS_KEYS = {
  ACTIVE_NODES: "sfu:nodes:active",
  NODE_INFO: (nodeId: string) => `sfu:node:${nodeId}:info`,
  NODE_STATS: (nodeId: string) => `sfu:node:${nodeId}:stats`,
  ROOM_ASSIGNMENT: (roomId: string) => `sfu:room:${roomId}:node`,
  ACTIVE_ROOMS: "sfu:rooms:active",
  PUBSUB_CHANNEL: "sfu:events:bus",
  ROOM_CHAT: (roomId: string) => `sfu:room:${roomId}:chat`,
  ROOM_CHAT_PINNED: (roomId: string) => `sfu:room:${roomId}:chat:pinned`,
  ROOM_POLL_ACTIVE: (roomId: string) => `sfu:room:${roomId}:poll:active`,
  ROOM_POLL_VOTES: (roomId: string, pollId: string) => `sfu:room:${roomId}:poll:${pollId}:votes`,
  ROOM_EVENTS_CHANNEL: (roomId: string) => `sfu:room:${roomId}:events`,
} as const;

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_MESSAGES: 100,
  RATE_LIMIT_MS: 800, // min ms between comments per user
} as const;

export const POLL_LIMITS = {
  MAX_OPTIONS: 6,
  MIN_OPTIONS: 2,
  MAX_QUESTION_LENGTH: 200,
  MAX_OPTION_LENGTH: 100,
  DEFAULT_DURATION_SECONDS: 60,
} as const;

export const DEFAULT_PERMISSIONS = {
  TEACHER: {
    canProduceAudio: true,
    canProduceVideo: true,
    canProduceScreen: true,
    canConsume: true,
  },
  STUDENT: {
    canProduceAudio: false,
    canProduceVideo: false,
    canProduceScreen: false,
    canConsume: true,
  },
  ADMIN: {
    canProduceAudio: true,
    canProduceVideo: true,
    canProduceScreen: true,
    canConsume: true,
  },
  GUEST: {
    canProduceAudio: false,
    canProduceVideo: false,
    canProduceScreen: false,
    canConsume: true,
  },
} as const;
