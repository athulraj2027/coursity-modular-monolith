import http from "http";
import { createApp } from "./app";
import { env } from "@/config/env";
import { redisManager } from "@/infrastructure/redis/RedisClient";
import { logger } from "@/shared/logger/Logger";

async function bootstrap(): Promise<void> {
  logger.info(`Starting Coursity Media Signaling Service [${env.SERVICE_NAME}] in ${env.NODE_ENV} mode...`);

  // 1. Verify Redis Connection
  try {
    await redisManager.connect();
    logger.success("Redis Coordination Cluster connected successfully");
  } catch (err) {
    logger.warn(`Redis connection warning: ${(err as Error).message}. Will retry in background.`);
  }

  // 2. Initialize App Container & WebSocket Server
  const { app, wsServer } = createApp();
  const server = http.createServer(app);

  wsServer.initialize(server);

  // 3. Start Listening
  server.listen(env.PORT, env.HOST, () => {
    logger.success(`🚀 Media Signaling HTTP & WebSocket Server running on http://${env.HOST}:${env.PORT}`);
    logger.info(`- REST Health: http://${env.HOST}:${env.PORT}/health`);
    logger.info(`- REST Signaling: http://${env.HOST}:${env.PORT}/api/v1/signaling/join`);
    logger.info(`- REST Cluster Nodes: http://${env.HOST}:${env.PORT}/api/v1/nodes`);
    logger.info(`- WebSocket Endpoint: ws://${env.HOST}:${env.PORT}/ws`);
  });

  // 4. Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down Media Signaling Service gracefully...`);

    wsServer.close();

    server.close(async () => {
      logger.info("HTTP server closed.");
      await redisManager.close();
      logger.success("Shutdown complete. Bye!");
      process.exit(0);
    });

    // Force exit after 10s if hung
    setTimeout(() => {
      logger.error("Forced termination after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  logger.error("Fatal Error during bootstrap:", err);
  process.exit(1);
});
