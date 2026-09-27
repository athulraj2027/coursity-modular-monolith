import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { WsMessageRouter, ClientConnectionContext } from "./WsMessageRouter";
import { SessionHandler } from "./handlers/SessionHandler";
import { logger } from "@/shared/logger/Logger";

export class WsServer {
  private wss: WebSocketServer | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly router: WsMessageRouter,
    private readonly sessionHandler: SessionHandler
  ) {}

  public initialize(server: HttpServer): WebSocketServer {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      maxPayload: 1024 * 1024, // 1MB max payload
    });

    this.wss.on("connection", (socket: WebSocket) => {
      const context: ClientConnectionContext = {
        socket,
        isAuthenticated: false,
      };

      // Mark socket alive for ping-pong
      (socket as unknown as { isAlive: boolean }).isAlive = true;

      socket.on("pong", () => {
        (socket as unknown as { isAlive: boolean }).isAlive = true;
      });

      socket.on("message", async (raw: Buffer | string) => {
        const messageStr = typeof raw === "string" ? raw : raw.toString("utf8");
        await this.router.handleMessage(context, messageStr);
      });

      socket.on("close", () => {
        if (context.roomId && context.userId) {
          logger.info(`Client [${context.userId}] disconnected from room [${context.roomId}]`);
          this.sessionHandler.handleLeave(context.roomId, context.userId);
        }
      });

      socket.on("error", (error) => {
        logger.warn(`Client socket error: ${error.message}`);
      });
    });

    // 30s ping-pong keepalive loop
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      for (const client of this.wss.clients) {
        const sock = client as unknown as { isAlive: boolean };
        if (sock.isAlive === false) {
          client.terminate();
          continue;
        }
        sock.isAlive = false;
        client.ping();
      }
    }, 30000);

    logger.success("WebSocket Server initialized on path /ws");
    return this.wss;
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      if (this.wss) {
        this.wss.close(() => {
          logger.info("WebSocket server closed.");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
