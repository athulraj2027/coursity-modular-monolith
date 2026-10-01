import express, { Express } from "express";
import cors from "cors";
import { requestLogger } from "@/presentation/middlewares/logging.middleware";
import { errorHandler } from "@/presentation/middlewares/error.middleware";
import { createHealthController } from "@/presentation/http/health.controller";
import { createSignalingController } from "@/presentation/http/signaling.controller";
import { createNodesController } from "@/presentation/http/nodes.controller";
import { createChatController } from "@/presentation/http/chat.controller";
import { createPollController } from "@/presentation/http/poll.controller";

// Infrastructure
import { RedisRoomRegistry } from "@/infrastructure/redis/RedisRoomRegistry";
import { RedisNodeStatsStore } from "@/infrastructure/redis/RedisNodeStatsStore";
import { RedisPubSubService } from "@/infrastructure/redis/RedisPubSubService";
import { RedisChatRepository } from "@/infrastructure/redis/RedisChatRepository";
import { RedisPollRepository } from "@/infrastructure/redis/RedisPollRepository";
import { JwtTokenService } from "@/infrastructure/security/JwtTokenService";
import { CoreApiClient } from "@/infrastructure/http-client/CoreApiClient";

// Handlers
import { SignalingHandler } from "@/infrastructure/websocket/handlers/SignalingHandler";
import { ChatHandler } from "@/infrastructure/websocket/handlers/ChatHandler";
import { PollHandler } from "@/infrastructure/websocket/handlers/PollHandler";
import { RoomHandler } from "@/infrastructure/websocket/handlers/RoomHandler";
import { WsMessageRouter } from "@/infrastructure/websocket/WsMessageRouter";
import { WsServer } from "@/infrastructure/websocket/WsServer";

// Application - Signaling & Placement
import { LeastLoadedStrategy } from "@/application/placement/LeastLoadedStrategy";
import { AllocateRoomUseCase } from "@/application/session/AllocateRoomUseCase";
import { AuthorizeJoinUseCase } from "@/application/session/AuthorizeJoinUseCase";
import { ReleaseRoomUseCase } from "@/application/session/ReleaseRoomUseCase";
import { GetActiveNodesUseCase } from "@/application/nodes/GetActiveNodesUseCase";
import { GetRoomAllocationUseCase } from "@/application/nodes/GetRoomAllocationUseCase";

// Application - Live Comments & Chat
import { SendCommentUseCase } from "@/application/chat/SendCommentUseCase";
import { GetChatHistoryUseCase } from "@/application/chat/GetChatHistoryUseCase";
import { PinCommentUseCase } from "@/application/chat/PinCommentUseCase";
import { DeleteCommentUseCase } from "@/application/chat/DeleteCommentUseCase";

// Application - Interactive Live Polls
import { CreatePollUseCase } from "@/application/poll/CreatePollUseCase";
import { VotePollUseCase } from "@/application/poll/VotePollUseCase";
import { EndPollUseCase } from "@/application/poll/EndPollUseCase";
import { GetActivePollUseCase } from "@/application/poll/GetActivePollUseCase";

export interface AppContainer {
  app: Express;
  wsServer: WsServer;
  redisRoomRegistry: RedisRoomRegistry;
  redisNodeStatsStore: RedisNodeStatsStore;
  redisPubSubService: RedisPubSubService;
  redisChatRepository: RedisChatRepository;
  redisPollRepository: RedisPollRepository;
}

export const createApp = (): AppContainer => {
  const app = express();

  // Middleware
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(requestLogger);

  // 1. Instantiate Infrastructure Repositories & Services
  const roomRegistry = new RedisRoomRegistry();
  const nodeStatsStore = new RedisNodeStatsStore();
  const pubSubService = new RedisPubSubService();
  const chatRepository = new RedisChatRepository();
  const pollRepository = new RedisPollRepository();
  const tokenService = new JwtTokenService();
  const coreApiClient = new CoreApiClient();

  // 2. Instantiate Placement Strategy & Signaling Use Cases
  const placementStrategy = new LeastLoadedStrategy();
  const allocateRoomUseCase = new AllocateRoomUseCase(roomRegistry, nodeStatsStore, placementStrategy);
  const authorizeJoinUseCase = new AuthorizeJoinUseCase(allocateRoomUseCase, tokenService, coreApiClient);
  const releaseRoomUseCase = new ReleaseRoomUseCase(roomRegistry, pubSubService);
  const getActiveNodesUseCase = new GetActiveNodesUseCase(nodeStatsStore);
  const getRoomAllocationUseCase = new GetRoomAllocationUseCase(roomRegistry, nodeStatsStore);

  // 3. Instantiate Live Comments Use Cases
  const sendCommentUseCase = new SendCommentUseCase(chatRepository, pubSubService);
  const getChatHistoryUseCase = new GetChatHistoryUseCase(chatRepository);
  const pinCommentUseCase = new PinCommentUseCase(chatRepository, pubSubService);
  const deleteCommentUseCase = new DeleteCommentUseCase(chatRepository, pubSubService);

  // 4. Instantiate Interactive Live Polls Use Cases
  const createPollUseCase = new CreatePollUseCase(pollRepository, pubSubService);
  const votePollUseCase = new VotePollUseCase(pollRepository, pubSubService);
  const endPollUseCase = new EndPollUseCase(pollRepository, pubSubService);
  const getActivePollUseCase = new GetActivePollUseCase(pollRepository);

  // 5. Instantiate WebSocket Handlers & Dispatcher
  const signalingHandler = new SignalingHandler(
    authorizeJoinUseCase,
    allocateRoomUseCase,
    getRoomAllocationUseCase
  );
  const chatHandler = new ChatHandler(
    sendCommentUseCase,
    getChatHistoryUseCase,
    pinCommentUseCase,
    deleteCommentUseCase
  );
  const pollHandler = new PollHandler(
    createPollUseCase,
    votePollUseCase,
    endPollUseCase,
    getActivePollUseCase
  );
  const roomHandler = new RoomHandler(
    getChatHistoryUseCase,
    getActivePollUseCase,
    pubSubService
  );

  const wsMessageRouter = new WsMessageRouter(
    signalingHandler,
    chatHandler,
    pollHandler,
    roomHandler
  );
  const wsServer = new WsServer(wsMessageRouter, tokenService, pubSubService);

  // 6. HTTP Routes
  app.use("/health", createHealthController(() => wsServer.getActiveConnectionCount()));
  app.use(
    "/api/v1/signaling",
    createSignalingController(
      authorizeJoinUseCase,
      allocateRoomUseCase,
      releaseRoomUseCase,
      getRoomAllocationUseCase
    )
  );
  app.use(
    "/api/v1/signaling",
    createChatController(
      sendCommentUseCase,
      getChatHistoryUseCase,
      pinCommentUseCase,
      deleteCommentUseCase
    )
  );
  app.use(
    "/api/v1/signaling",
    createPollController(
      createPollUseCase,
      votePollUseCase,
      endPollUseCase,
      getActivePollUseCase
    )
  );
  app.use("/api/v1/nodes", createNodesController(getActiveNodesUseCase, nodeStatsStore));

  // Global Error Handler
  app.use(errorHandler);

  return {
    app,
    wsServer,
    redisRoomRegistry: roomRegistry,
    redisNodeStatsStore: nodeStatsStore,
    redisPubSubService: pubSubService,
    redisChatRepository: chatRepository,
    redisPollRepository: pollRepository,
  };
};
