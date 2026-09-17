import http from "http";
import { env } from "../shared/config/env.config";
import { logger } from "../shared/logger";
import { DeepgramSTTProvider } from "../modules/session/infrastructure/providers/deepgram-stt.provider";
import { ElevenLabsTTSProvider } from "../modules/session/infrastructure/providers/elevenlabs-tts.provider";
import { S3AudioStorageService } from "../modules/session/infrastructure/storage/s3-audio-storage.service";
import { HttpBackendSyncService } from "../modules/session/infrastructure/sync/http-backend-sync.service";
import { InMemorySessionRegistry } from "../modules/session/infrastructure/registry/in-memory-session.registry";
import { setupSessionGateway } from "../modules/session/presentation/websocket/session.gateway";
import { createHttpHandler } from "./app";

const sessionRegistry = new InMemorySessionRegistry();
const sttService = new DeepgramSTTProvider();
const ttsService = new ElevenLabsTTSProvider();
const syncService = new HttpBackendSyncService();
const storageService = new S3AudioStorageService();

const server = http.createServer(createHttpHandler(sessionRegistry));

const wss = setupSessionGateway(server, {
  sttService,
  ttsService,
  syncService,
  storageService,
  sessionRegistry,
});

server.listen(env.PORT, () => {
  console.log("\n==========================================================================");
  console.log(`🎙️  [Coursity AI Interview Engine - Modular Monolith (Clean Architecture)]`);
  console.log(`🤖  12 Reasoning & Cognitive Agents Orchestrated via LangGraph`);
  console.log(`📡  Listening on port ${env.PORT} (HTTP & WebSocket)`);
  console.log(`🔗  WebSocket Gateway: ws://localhost:${env.PORT}/interview`);
  console.log(`💓  Health Check: http://localhost:${env.PORT}/health`);
  console.log("==========================================================================\n");
});

const shutdown = () => {
  logger.info("Gracefully shutting down AI Interview Server...");
  wss.close(() => {
    server.close(() => {
      logger.success("AI Interview Server terminated.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { server, wss, sessionRegistry };
