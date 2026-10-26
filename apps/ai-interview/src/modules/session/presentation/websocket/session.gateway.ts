import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "../../../../shared/logger";
import { IInterviewSession } from "../../domain/ports/interview-session.port";
import { ISessionRegistry } from "../../domain/ports/session-registry.port";
import { ISTTService } from "../../domain/ports/stt.port";
import { ITTSService } from "../../domain/ports/tts.port";
import { IBackendSyncService } from "../../domain/ports/backend-sync.port";
import { IAudioStorageService } from "../../domain/ports/audio-storage.port";
import { IRealtimeAuthenticator } from "../../domain/ports/realtime-authenticator.port";
import { JwtRealtimeAuthenticator } from "../../infrastructure/auth/jwt-realtime.authenticator";
import { ISessionCoordinatorFactory } from "../../domain/ports/session-coordinator-factory.port";
import { DefaultSessionCoordinatorFactory } from "../../application/coordinator/default-session-coordinator.factory";

export interface GatewayDependencies {
  sttService: ISTTService;
  ttsService: ITTSService;
  syncService: IBackendSyncService;
  storageService: IAudioStorageService;
  sessionRegistry: ISessionRegistry;
  authenticator?: IRealtimeAuthenticator;
  coordinatorFactory?: ISessionCoordinatorFactory;
}

export function setupSessionGateway(
  server: http.Server,
  deps: GatewayDependencies
): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/interview" });
  const authenticator = deps.authenticator || new JwtRealtimeAuthenticator();
  const coordinatorFactory = deps.coordinatorFactory || new DefaultSessionCoordinatorFactory();

  function sendJson(ws: WebSocket, msg: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  wss.on("connection", (ws: WebSocket, req) => {
    logger.info(`[Gateway] Inbound WebSocket connection from ${req.socket.remoteAddress}`);

    let currentCoordinator: IInterviewSession | null = null;
    let isAuthenticated = false;
    const pendingBinaryChunks: Buffer[] = [];

    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const queryToken = url.searchParams.get("token");
    const querySessionId = url.searchParams.get("sessionId");

    const authenticateAndStart = async (token: string, sessionId: string) => {
      try {
        const auth = await authenticator.authenticate(token, sessionId);

        await deps.syncService.initializeSession(sessionId, `ws-room-${sessionId}`);

        currentCoordinator = coordinatorFactory.createCoordinator({
          sessionId,
          auth,
          ws,
          sttService: deps.sttService,
          ttsService: deps.ttsService,
          syncService: deps.syncService,
          storageService: deps.storageService,
        });

        deps.sessionRegistry.registerSession(sessionId, currentCoordinator);
        isAuthenticated = true;

        // Flush any binary audio chunks received during authentication handshake
        while (pendingBinaryChunks.length > 0) {
          const chunk = pendingBinaryChunks.shift();
          if (chunk && currentCoordinator) {
            currentCoordinator.handleInboundMessage({
              type: "AUDIO_CHUNK",
              audioBase64: chunk.toString("base64"),
            });
          }
        }

        sendJson(ws, {
          type: "AUTH_SUCCESS",
          phase: "INITIALIZING",
          meta: { sessionId, userId: auth.userId, candidateName: auth.candidateName },
        });
      } catch (err: any) {
        logger.error("[Gateway] Authentication failed:", err.message);
        sendJson(ws, {
          type: "AUTH_ERROR",
          error: "Invalid or expired realtime session token",
        });
        ws.close(4001, "Authentication failed");
        return;
      }

      // Start interview coordinator after successful authentication
      if (currentCoordinator) {
        try {
          await currentCoordinator.start();
        } catch (startErr: any) {
          logger.error(`[Gateway] Error starting coordinator for session ${sessionId}:`, startErr.message);
          sendJson(ws, {
            type: "ERROR",
            error: "Failed to start interview conversation: " + startErr.message,
          });
        }
      }
    };

    if (queryToken && querySessionId) {
      authenticateAndStart(queryToken, querySessionId);
    }

    ws.on("message", async (data, isBinary) => {
      try {
        if (isBinary) {
          let buffer: Buffer;
          if (Buffer.isBuffer(data)) {
            buffer = data;
          } else if (data instanceof ArrayBuffer) {
            buffer = Buffer.from(data);
          } else if (Array.isArray(data)) {
            buffer = Buffer.concat(data);
          } else {
            buffer = Buffer.from(data as any);
          }

          if (currentCoordinator && isAuthenticated) {
            currentCoordinator.handleInboundMessage({
              type: "AUDIO_CHUNK",
              audioBase64: buffer.toString("base64"),
            });
          } else if (!isAuthenticated && pendingBinaryChunks.length < 50) {
            pendingBinaryChunks.push(buffer);
          }
          return;
        }

        const raw = data.toString();
        const message = JSON.parse(raw);

        if (message.type === "AUTH") {
          if (message.token && message.sessionId) {
            await authenticateAndStart(message.token, message.sessionId);
          } else {
            sendJson(ws, {
              type: "AUTH_ERROR",
              error: "Missing token or sessionId in AUTH message",
            });
          }
          return;
        }

        if (!isAuthenticated || !currentCoordinator) {
          sendJson(ws, {
            type: "AUTH_ERROR",
            error: "Unauthorized: Send AUTH message first",
          });
          return;
        }

        currentCoordinator.handleInboundMessage(message);
      } catch (error: any) {
        logger.error("[Gateway] Error processing message:", error.message);
        sendJson(ws, { type: "ERROR", error: error.message });
      }
    });

    ws.on("close", async () => {
      if (currentCoordinator) {
        logger.info(`[Gateway] Connection closed for session: ${currentCoordinator.sessionId}`);
        deps.sessionRegistry.removeSession(currentCoordinator.sessionId);
        await currentCoordinator.handleClientDisconnect();
      }
    });

    ws.on("error", (err) => {
      logger.error("[Gateway] Connection error:", err.message);
    });
  });

  return wss;
}
