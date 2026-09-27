import type { WebSocket } from "ws";
import { SessionHandler } from "./handlers/SessionHandler";
import { TransportHandler } from "./handlers/TransportHandler";
import { ProducerConsumerHandler } from "./handlers/ProducerConsumerHandler";
import { AppError, UnauthorizedError, BadRequestError } from "@/shared/errors/AppErrors";
import { logger } from "@/shared/logger/Logger";
import type {
  WsRequest,
  WsResponse,
  JoinSessionRequestData,
  CreateTransportRequestData,
  ConnectTransportRequestData,
  ProduceMediaRequestData,
  ConsumeMediaRequestData,
  ResumeConsumerRequestData,
  CloseProducerRequestData,
} from "@/shared/types/ws-protocol.types";

export interface ClientConnectionContext {
  socket: WebSocket;
  roomId?: string;
  userId?: string;
  isAuthenticated: boolean;
}

export class WsMessageRouter {
  constructor(
    private readonly sessionHandler: SessionHandler,
    private readonly transportHandler: TransportHandler,
    private readonly producerConsumerHandler: ProducerConsumerHandler
  ) {}

  public async handleMessage(
    context: ClientConnectionContext,
    rawMessage: string
  ): Promise<void> {
    let request: WsRequest;
    try {
      request = JSON.parse(rawMessage) as WsRequest;
    } catch {
      this.sendResponse(context.socket, {
        id: "unknown",
        type: "response",
        ok: false,
        error: { code: "INVALID_JSON", message: "Malformed JSON payload" },
      });
      return;
    }

    if (!request.id || !request.type) {
      this.sendResponse(context.socket, {
        id: request?.id || "unknown",
        type: "response",
        ok: false,
        error: { code: "INVALID_REQUEST", message: "Missing request id or type" },
      });
      return;
    }

    try {
      const responseData = await this.dispatch(context, request);
      this.sendResponse(context.socket, {
        id: request.id,
        type: "response",
        ok: true,
        data: responseData,
      });
    } catch (error: unknown) {
      const appError = error instanceof AppError ? error : null;
      const code = appError?.errorCode || "INTERNAL_ERROR";
      const message = error instanceof Error ? error.message : "An unknown error occurred";

      logger.warn(`WS Error on [${request.type}] from [${context.userId || "anonymous"}]: ${message}`);

      this.sendResponse(context.socket, {
        id: request.id,
        type: "response",
        ok: false,
        error: { code, message },
      });
    }
  }

  private async dispatch(
    context: ClientConnectionContext,
    request: WsRequest
  ): Promise<unknown> {
    // 1. Session Join (Authentication)
    if (request.type === "session:join") {
      const { response, sessionContext } = await this.sessionHandler.handleJoin(
        context.socket,
        request.data as JoinSessionRequestData
      );
      context.roomId = sessionContext.roomId;
      context.userId = sessionContext.userId;
      context.isAuthenticated = true;
      return response;
    }

    // All subsequent actions require active authentication
    if (!context.isAuthenticated || !context.roomId || !context.userId) {
      throw new UnauthorizedError("Client must join a session before sending media commands");
    }

    switch (request.type) {
      case "transport:create":
        return await this.transportHandler.handleCreateTransport(
          context.roomId,
          context.userId,
          request.data as CreateTransportRequestData
        );

      case "transport:connect":
        return await this.transportHandler.handleConnectTransport(
          context.roomId,
          context.userId,
          request.data as ConnectTransportRequestData
        );

      case "media:produce":
        return await this.producerConsumerHandler.handleProduce(
          context.roomId,
          context.userId,
          request.data as ProduceMediaRequestData
        );

      case "media:consume":
        return await this.producerConsumerHandler.handleConsume(
          context.roomId,
          context.userId,
          request.data as ConsumeMediaRequestData
        );

      case "media:resumeConsumer":
        return await this.producerConsumerHandler.handleResumeConsumer(
          context.roomId,
          context.userId,
          request.data as ResumeConsumerRequestData
        );

      case "media:closeProducer":
        return this.producerConsumerHandler.handleCloseProducer(
          context.roomId,
          context.userId,
          request.data as CloseProducerRequestData
        );

      case "session:leave":
        this.sessionHandler.handleLeave(context.roomId, context.userId);
        context.roomId = undefined;
        context.userId = undefined;
        context.isAuthenticated = false;
        return { left: true };

      case "ping":
        return { pong: Date.now() };

      default:
        throw new BadRequestError(`Unsupported action type: ${request.type}`);
    }
  }

  private sendResponse(socket: WebSocket, response: WsResponse): void {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(response));
    }
  }
}
