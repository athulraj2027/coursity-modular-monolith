import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { env } from "../../../../shared/config/env.config";
import { logger } from "../../../../shared/logger";
import { InterviewSessionCoordinator } from "../../application/coordinator/interview-session.coordinator";
import { InMemorySessionRegistry } from "../../infrastructure/registry/in-memory-session.registry";
import { ISTTService } from "../../domain/ports/stt.port";
import { ITTSService } from "../../domain/ports/tts.port";
import { IBackendSyncService } from "../../domain/ports/backend-sync.port";
import { IAudioStorageService } from "../../domain/ports/audio-storage.port";

export interface GatewayDependencies {
  sttService: ISTTService;
  ttsService: ITTSService;
  syncService: IBackendSyncService;
  storageService: IAudioStorageService;
  sessionRegistry: InMemorySessionRegistry;
}

export function setupSessionGateway(
  server: http.Server,
  deps: GatewayDependencies
): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/interview" });

  function sendJson(ws: WebSocket, msg: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  wss.on("connection", (ws: WebSocket, req) => {
    logger.info(`[Gateway] Inbound WebSocket connection from ${req.socket.remoteAddress}`);

    let currentCoordinator: InterviewSessionCoordinator | null = null;
    let isAuthenticated = false;

    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const queryToken = url.searchParams.get("token");
    const querySessionId = url.searchParams.get("sessionId");

    const authenticateAndStart = async (token: string, sessionId: string) => {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        if (decoded.sessionId && decoded.sessionId !== sessionId) {
          throw new Error("Token sessionId mismatch");
        }

        const userId = decoded.sub || decoded.userId || "usr_anonymous";
        const candidateName = decoded.name || "Candidate";

        logger.success(
          `[Gateway] Authenticated session ${sessionId} for candidate "${candidateName}"`
        );

        await deps.syncService.initializeSession(sessionId, `ws-room-${sessionId}`);

        currentCoordinator = new InterviewSessionCoordinator({
          sessionId,
          candidate: {
            userId,
            name: candidateName,
            email: decoded.email,
            bio: decoded.bio,
            experienceYears: decoded.experienceYears,
            expertise: decoded.expertise,
            qualifications: decoded.qualifications,
            resumeHighlights: decoded.resumeHighlights,
          },
          domain: decoded.domain || "Technical Evaluation",
          difficulty: decoded.difficulty || "INTERMEDIATE",
          systemPrompt: decoded.systemPrompt,
          totalQuestions: decoded.totalQuestions || 5,
          topics: decoded.topics,
          voiceId: decoded.voiceId,
          ws,
          sttService: deps.sttService,
          ttsService: deps.ttsService,
          syncService: deps.syncService,
          storageService: deps.storageService,
        });

        deps.sessionRegistry.registerSession(sessionId, currentCoordinator);
        isAuthenticated = true;

        sendJson(ws, {
          type: "AUTH_SUCCESS",
          phase: "INITIALIZING",
          meta: { sessionId, userId, candidateName },
        });

        await currentCoordinator.start();
      } catch (err: any) {
        logger.error("[Gateway] Authentication failed:", err.message);
        sendJson(ws, {
          type: "AUTH_ERROR",
          error: "Invalid or expired realtime session token",
        });
        ws.close(4001, "Authentication failed");
      }
    };

    if (queryToken && querySessionId) {
      authenticateAndStart(queryToken, querySessionId);
    }

    ws.on("message", async (data, isBinary) => {
      try {
        if (isBinary) {
          if (currentCoordinator && isAuthenticated) {
            currentCoordinator.handleInboundMessage({
              type: "AUDIO_CHUNK",
              audioBase64: (data as Buffer).toString("base64"),
            });
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
