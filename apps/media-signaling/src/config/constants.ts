export const REDIS_KEYS = {
  ACTIVE_NODES: "sfu:nodes:active",
  NODE_INFO: (nodeId: string) => `sfu:node:${nodeId}:info`,
  NODE_STATS: (nodeId: string) => `sfu:node:${nodeId}:stats`,
  ROOM_ASSIGNMENT: (roomId: string) => `sfu:room:${roomId}:node`,
  ACTIVE_ROOMS: "sfu:rooms:active",
  PUBSUB_CHANNEL: "sfu:events:bus",
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
