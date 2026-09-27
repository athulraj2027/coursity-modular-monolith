import express, { Express } from "express";
import cors from "cors";
import { requestLogger } from "@/presentation/middlewares/logging.middleware";
import { errorHandler } from "@/presentation/middlewares/error.middleware";
import { createHealthController } from "@/presentation/http/health.controller";
import { createSignalingController } from "@/presentation/http/signaling.controller";
import { createNodesController } from "@/presentation/http/nodes.controller";

// Infrastructure
import { RedisRoomRegistry } from "@/infrastructure/redis/RedisRoomRegistry";
import { RedisNodeStatsStore } from "@/infrastructure/redis/RedisNodeStatsStore";
import { RedisPubSubService } from "@/infrastructure/redis/RedisPubSubService";
import { JwtTokenService } from "@/infrastructure/security/JwtTokenService";
import { CoreApiClient } from "@/infrastructure/http-client/CoreApiClient";
import { SignalingHandler } from "@/infrastructure/websocket/handlers/SignalingHandler";
import { WsMessageRouter } from "@/infrastructure/websocket/WsMessageRouter";
import { WsServer } from "@/infrastructure/websocket/WsServer";

// Application
import { LeastLoadedStrategy } from "@/application/placement/LeastLoadedStrategy";
import { AllocateRoomUseCase } from "@/application/session/AllocateRoomUseCase";
import { AuthorizeJoinUseCase } from "@/application/session/AuthorizeJoinUseCase";
import { ReleaseRoomUseCase } from "@/application/session/ReleaseRoomUseCase";
import { GetActiveNodesUseCase } from "@/application/nodes/GetActiveNodesUseCase";
import { GetRoomAllocationUseCase } from "@/application/nodes/GetRoomAllocationUseCase";

export interface AppContainer {
  app: Express;
  wsServer: WsServer;
  redisRoomRegistry: RedisRoomRegistry;
  redisNodeStatsStore: RedisNodeStatsStore;
  redisPubSubService: RedisPubSubService;
}

export const createApp = (): AppContainer => {
  const app = express();

  // Middleware
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use(requestLogger);

  // 1. Instantiate Infrastructure
  const roomRegistry = new RedisRoomRegistry();
  const nodeStatsStore = new RedisNodeStatsStore();
  const pubSubService = new RedisPubSubService();
  const tokenService = new JwtTokenService();
  const coreApiClient = new CoreApiClient();

  // 2. Instantiate Placement Strategy & Use Cases
  const placementStrategy = new LeastLoadedStrategy();
  const allocateRoomUseCase = new AllocateRoomUseCase(roomRegistry, nodeStatsStore, placementStrategy);
  const authorizeJoinUseCase = new AuthorizeJoinUseCase(allocateRoomUseCase, tokenService, coreApiClient);
  const releaseRoomUseCase = new ReleaseRoomUseCase(roomRegistry, pubSubService);
  const getActiveNodesUseCase = new GetActiveNodesUseCase(nodeStatsStore);
  const getRoomAllocationUseCase = new GetRoomAllocationUseCase(roomRegistry, nodeStatsStore);

  // 3. Instantiate WebSocket Components
  const signalingHandler = new SignalingHandler(
    authorizeJoinUseCase,
    allocateRoomUseCase,
    getRoomAllocationUseCase
  );
  const wsMessageRouter = new WsMessageRouter(signalingHandler);
  const wsServer = new WsServer(wsMessageRouter, tokenService);

  // 4. HTTP Routes
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
  app.use("/api/v1/nodes", createNodesController(getActiveNodesUseCase, nodeStatsStore));

  // Global Error Handler
  app.use(errorHandler);

  return {
    app,
    wsServer,
    redisRoomRegistry: roomRegistry,
    redisNodeStatsStore: nodeStatsStore,
    redisPubSubService: pubSubService,
  };
};
