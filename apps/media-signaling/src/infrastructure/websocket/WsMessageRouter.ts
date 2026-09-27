import { WebSocket } from "ws";
import { SignalingHandler } from "./handlers/SignalingHandler";
import {
  WsRequest,
  WsResponse,
  JoinSessionRequestData,
  AllocateRoomRequestData,
  RoomQueryRequestData,
} from "@/shared/types/ws-signaling.types";
import { AppError } from "@/shared/errors/AppErrors";
import { logger } from "@/shared/logger/Logger";

export class WsMessageRouter {
  constructor(private readonly signalingHandler: SignalingHandler) {}

  public async handleMessage(
    ws: WebSocket,
    raw: string,
    authContext?: { userId?: string; role?: string }
  ): Promise<void> {
    let req: WsRequest;

    try {
      req = JSON.parse(raw);
    } catch {
      this.sendError(ws, "invalid_id", "INVALID_JSON", "Message is not valid JSON");
      return;
    }

    if (!req.id || !req.type) {
      this.sendError(ws, req.id || "invalid_id", "MALFORMED_REQUEST", "id and type are required");
      return;
    }

    try {
      switch (req.type) {
        case "session:join": {
          const result = await this.signalingHandler.handleJoin(
            req.data as JoinSessionRequestData,
            authContext
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "session:allocate": {
          const result = await this.signalingHandler.handleAllocate(
            req.data as AllocateRoomRequestData
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "room:query": {
          const result = await this.signalingHandler.handleRoomQuery(
            req.data as RoomQueryRequestData
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "ping": {
          this.sendSuccess(ws, req.id, { pong: true, timestamp: Date.now() });
          break;
        }

        default: {
          this.sendError(
            ws,
            req.id,
            "UNKNOWN_METHOD",
            `Unsupported message type: ${(req as any).type}`
          );
          break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof AppError) {
        this.sendError(ws, req.id, err.code, err.message, err.details);
      } else {
        const msg = err instanceof Error ? err.message : "Internal Server Error";
        logger.error(`Unhandled error during WS message ${req.type}:`, err);
        this.sendError(ws, req.id, "INTERNAL_ERROR", msg);
      }
    }
  }

  private sendSuccess<T>(ws: WebSocket, id: string, data: T): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    const response: WsResponse<T> = {
      id,
      type: "response",
      ok: true,
      data,
    };
    ws.send(JSON.stringify(response));
  }

  private sendError(
    ws: WebSocket,
    id: string,
    code: string,
    message: string,
    details?: unknown
  ): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    const response: WsResponse = {
      id,
      type: "response",
      ok: false,
      error: {
        code,
        message,
        details,
      },
    };
    ws.send(JSON.stringify(response));
  }
}
