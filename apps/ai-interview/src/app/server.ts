import http from "http";
import { env } from "../shared/config/env.config";
import { logger } from "../shared/logger";
import { DeepgramSTTProvider } from "../modules/session/infrastructure/providers/deepgram-stt.provider";
import { ElevenLabsTTSProvider } from "../modules/session/infrastructure/providers/elevenlabs-tts.provider";
import { DeepgramTTSProvider } from "../modules/session/infrastructure/providers/deepgram-tts.provider";
import { FallbackTTSProvider } from "../modules/session/infrastructure/providers/fallback-tts.provider";
import { S3AudioStorageService } from "../modules/session/infrastructure/storage/s3-audio-storage.service";
import { HttpBackendSyncService } from "../modules/session/infrastructure/sync/http-backend-sync.service";
import { InMemorySessionRegistry } from "../modules/session/infrastructure/registry/in-memory-session.registry";
import { ISessionRegistry } from "../modules/session/domain/ports/session-registry.port";
import { ISTTService } from "../modules/session/domain/ports/stt.port";
import { ITTSService } from "../modules/session/domain/ports/tts.port";
import { IBackendSyncService } from "../modules/session/domain/ports/backend-sync.port";
import { IAudioStorageService } from "../modules/session/domain/ports/audio-storage.port";
import { setupSessionGateway } from "../modules/session/presentation/websocket/session.gateway";
import { createHttpHandler } from "./app";

const sessionRegistry: ISessionRegistry = new InMemorySessionRegistry();
const sttService: ISTTService = new DeepgramSTTProvider();
const elevenLabsTTS = new ElevenLabsTTSProvider();
const deepgramTTS = new DeepgramTTSProvider();
const ttsService: ITTSService = new FallbackTTSProvider(elevenLabsTTS, [deepgramTTS]);
const syncService: IBackendSyncService = new HttpBackendSyncService();
const storageService: IAudioStorageService = new S3AudioStorageService();

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
