import http from "http";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";
import { createApp } from "./app";

// Infrastructure
import { WorkerPool } from "@/infrastructure/mediasoup/WorkerPool";
import { RouterManager } from "@/infrastructure/mediasoup/RouterManager";
import { InMemorySessionRegistry } from "@/infrastructure/registry/InMemorySessionRegistry";
import { HeartbeatReporter } from "@/infrastructure/redis/HeartbeatReporter";
import { redis } from "@/infrastructure/redis/RedisClient";

// Application Use Cases
import { GetOrCreateSessionUseCase } from "@/application/session/GetOrCreateSessionUseCase";
import { JoinSessionUseCase } from "@/application/session/JoinSessionUseCase";
import { LeaveSessionUseCase } from "@/application/session/LeaveSessionUseCase";
import { CreateWebRtcTransportUseCase } from "@/application/media/CreateWebRtcTransportUseCase";
import { ConnectTransportUseCase } from "@/application/media/ConnectTransportUseCase";
import { ProduceMediaUseCase } from "@/application/media/ProduceMediaUseCase";
import { ConsumeMediaUseCase } from "@/application/media/ConsumeMediaUseCase";
import { ResumeConsumerUseCase } from "@/application/media/ResumeConsumerUseCase";
import { CloseProducerUseCase } from "@/application/media/CloseProducerUseCase";

// WebSocket Presentation
import { SessionHandler } from "@/infrastructure/websocket/handlers/SessionHandler";
import { TransportHandler } from "@/infrastructure/websocket/handlers/TransportHandler";
import { ProducerConsumerHandler } from "@/infrastructure/websocket/handlers/ProducerConsumerHandler";
import { WsMessageRouter } from "@/infrastructure/websocket/WsMessageRouter";
import { WsServer } from "@/infrastructure/websocket/WsServer";

const bootstrap = async () => {
  try {
    logger.info(`Starting Coursity Media SFU Node [${env.NODE_ID}]...`);

    // 1. Initialize Mediasoup Worker Pool
    const workerPool = new WorkerPool();
    await workerPool.initialize();

    // 2. Core Managers & Registries
    const routerManager = new RouterManager(workerPool);
    const sessionRegistry = new InMemorySessionRegistry();
    const heartbeatReporter = new HeartbeatReporter(sessionRegistry, () =>
      workerPool.getWorkerCount()
    );

    // 3. Connect to Redis & Register Node
    if (redis.status === "wait") {
      await redis.connect().catch((err) => {
        logger.warn(`Redis connection failed on startup: ${err?.message || err}`);
      });
    }

    await heartbeatReporter.registerNode(env.NODE_ID, {
      wsUrl: `ws://${env.MEDIASOUP_ANNOUNCED_IP}:${env.PORT}/ws`,
      httpUrl: `http://${env.MEDIASOUP_ANNOUNCED_IP}:${env.PORT}`,
    });
    heartbeatReporter.start();

    // 4. Initialize Application Use Cases
    const getOrCreateSession = new GetOrCreateSessionUseCase(sessionRegistry, routerManager);
    const joinSession = new JoinSessionUseCase(getOrCreateSession);
    const leaveSession = new LeaveSessionUseCase(sessionRegistry, routerManager);

    const createTransport = new CreateWebRtcTransportUseCase(sessionRegistry);
    const connectTransport = new ConnectTransportUseCase(sessionRegistry);
    const produceMedia = new ProduceMediaUseCase(sessionRegistry);
    const consumeMedia = new ConsumeMediaUseCase(sessionRegistry);
    const resumeConsumer = new ResumeConsumerUseCase(sessionRegistry);
    const closeProducer = new CloseProducerUseCase(sessionRegistry);

    // 5. Initialize WebSocket Handlers & Dispatcher
    const sessionHandler = new SessionHandler(joinSession, leaveSession);
    const transportHandler = new TransportHandler(createTransport, connectTransport);
    const producerConsumerHandler = new ProducerConsumerHandler(
      produceMedia,
      consumeMedia,
      resumeConsumer,
      closeProducer
    );

    const wsRouter = new WsMessageRouter(sessionHandler, transportHandler, producerConsumerHandler);
    const wsServer = new WsServer(wsRouter, sessionHandler);

    // 6. Bootstrap HTTP App & WS Gateway
    const app = createApp({ workerPool, sessionRegistry, heartbeatReporter });
    const server = http.createServer(app);

    wsServer.initialize(server);

    // 7. Start Listening
    server.listen(env.PORT, () => {
      console.log("\n==========================================================================");
      console.log(`🎥  [Coursity Media SFU Node - Mediasoup v3 Daemon]`);
      console.log(`🚀  Node ID: ${env.NODE_ID}`);
      console.log(`📡  HTTP & WS Listening on port ${env.PORT}`);
      console.log(`🔗  WebSocket Gateway: ws://${env.MEDIASOUP_ANNOUNCED_IP}:${env.PORT}/ws`);
      console.log(`💓  Health Check: http://localhost:${env.PORT}/health`);
      console.log(`📊  Admin Stats: http://localhost:${env.PORT}/admin/stats`);
      console.log(`⚡  RTC Port Range: ${env.RTC_MIN_PORT} - ${env.RTC_MAX_PORT} (UDP/TCP)`);
      console.log("==========================================================================\n");
    });

    // 8. Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully terminating SFU Node...`);

      heartbeatReporter.stop();
      await heartbeatReporter.unregisterNode(env.NODE_ID);

      await wsServer.close();
      await workerPool.close();

      if (redis.status === "ready" || redis.status === "connect") {
        await redis.quit();
        logger.info("Redis disconnected.");
      }

      server.close(() => {
        logger.success("SFU HTTP Server closed. Node terminated.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("❌ Fatal startup error in media-sfu:", error);
    process.exit(1);
  }
};

bootstrap();
