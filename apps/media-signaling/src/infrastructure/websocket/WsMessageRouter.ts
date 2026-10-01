import { WebSocket } from "ws";
import { SignalingHandler } from "./handlers/SignalingHandler";
import { ChatHandler } from "./handlers/ChatHandler";
import { PollHandler } from "./handlers/PollHandler";
import { RoomHandler } from "./handlers/RoomHandler";
import {
  WsRequest,
  WsResponse,
  JoinSessionRequestData,
  AllocateRoomRequestData,
  RoomQueryRequestData,
  RoomEnterRequestData,
  RoomReactionRequestData,
  SendCommentRequestData,
  ChatHistoryRequestData,
  PinCommentRequestData,
  DeleteCommentRequestData,
  CreatePollRequestData,
  VotePollRequestData,
  EndPollRequestData,
  ActivePollRequestData,
} from "@/shared/types/ws-signaling.types";
import { AppError } from "@/shared/errors/AppErrors";
import { logger } from "@/shared/logger/Logger";

export interface WsContext {
  userId?: string;
  role?: string;
  displayName?: string;
  roomId?: string;
  setRoomId?: (roomId: string) => void;
}

export class WsMessageRouter {
  constructor(
    private readonly signalingHandler: SignalingHandler,
    private readonly chatHandler: ChatHandler,
    private readonly pollHandler: PollHandler,
    private readonly roomHandler: RoomHandler
  ) {}

  public async handleMessage(
    ws: WebSocket,
    raw: string,
    context?: WsContext
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
        // ==================== Signaling & Allocation ====================
        case "session:join": {
          const result = await this.signalingHandler.handleJoin(
            req.data as JoinSessionRequestData,
            context
          );
          if (context?.setRoomId && result.classSessionId) {
            context.setRoomId(result.classSessionId);
          }
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

        // ==================== Room Subscription & State ====================
        case "room:enter": {
          const data = req.data as RoomEnterRequestData;
          if (context?.setRoomId && data.roomId) {
            context.setRoomId(data.roomId);
          }
          const result = await this.roomHandler.handleEnter(data, context);
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "room:leave": {
          if (context?.setRoomId) {
            context.setRoomId("");
          }
          this.sendSuccess(ws, req.id, { left: true });
          break;
        }

        case "room:reaction": {
          const result = await this.roomHandler.handleReaction(
            req.data as RoomReactionRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        // ==================== Live Comments & Chat ====================
        case "chat:send": {
          const result = await this.chatHandler.handleSend(
            req.data as SendCommentRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "chat:history": {
          const result = await this.chatHandler.handleHistory(
            req.data as ChatHistoryRequestData
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "chat:pin": {
          const result = await this.chatHandler.handlePin(
            req.data as PinCommentRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "chat:delete": {
          const result = await this.chatHandler.handleDelete(
            req.data as DeleteCommentRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        // ==================== Interactive Live Polls ====================
        case "poll:create": {
          const result = await this.pollHandler.handleCreate(
            req.data as CreatePollRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "poll:vote": {
          const result = await this.pollHandler.handleVote(
            req.data as VotePollRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "poll:end": {
          const result = await this.pollHandler.handleEnd(
            req.data as EndPollRequestData,
            context
          );
          this.sendSuccess(ws, req.id, result);
          break;
        }

        case "poll:active": {
          const result = await this.pollHandler.handleActive(
            req.data as ActivePollRequestData,
            context
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
