import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseUrl } from "url";
import { WsMessageRouter } from "./WsMessageRouter";
import { ITokenService } from "@/domain/ports/ITokenService";
import { logger } from "@/shared/logger/Logger";

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
  connectionId: string;
}

export class WsServer {
  private wss: WebSocketServer | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly messageRouter: WsMessageRouter,
    private readonly tokenService: ITokenService
  ) {}

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      const { pathname, query } = parseUrl(req.url || "", true);

      if (pathname === "/ws" || pathname === "/signaling") {
        let authContext: { userId?: string; role?: string } | undefined;

        // Optional token authentication on WS upgrade
        const token = (query.token as string) || (req.headers["sec-websocket-protocol"] as string);
        if (token) {
          try {
            const decoded = this.tokenService.verifyToken<{
              userId?: string;
              id?: string;
              role?: string;
            }>(token);
            authContext = {
              userId: decoded.userId || decoded.id,
              role: decoded.role,
            };
          } catch (err) {
            logger.warn("WS Upgrade token verification failed:", (err as Error).message);
          }
        }

        this.wss!.handleUpgrade(req, socket, head, (ws) => {
          const authWs = ws as AuthenticatedWebSocket;
          authWs.isAlive = true;
          authWs.connectionId = `conn-${Math.random().toString(36).substring(2, 9)}`;
          if (authContext) {
            authWs.userId = authContext.userId;
            authWs.role = authContext.role;
          }

          this.wss!.emit("connection", authWs, req);
        });
      }
    });

    this.wss.on("connection", (ws: AuthenticatedWebSocket) => {
      logger.info(`Signaling Client connected [connId: ${ws.connectionId}] (user: ${ws.userId || "anonymous"})`);

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", async (data: Buffer | string) => {
        const raw = data.toString();
        await this.messageRouter.handleMessage(ws, raw, {
          userId: ws.userId,
          role: ws.role,
        });
      });

      ws.on("close", (code, reason) => {
        logger.info(
          `Signaling Client disconnected [connId: ${ws.connectionId}] (code: ${code}, reason: ${reason.toString()})`
        );
      });

      ws.on("error", (error) => {
        logger.error(`WebSocket error on conn [${ws.connectionId}]:`, error);
      });
    });

    // Heartbeat ping-pong to detect dead connections
    this.pingInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((client) => {
        const authWs = client as AuthenticatedWebSocket;
        if (!authWs.isAlive) {
          logger.debug(`Terminating stale signaling connection [${authWs.connectionId}]`);
          return authWs.terminate();
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000);

    logger.success("WebSocket Signaling Server attached to /ws & /signaling");
  }

  public getActiveConnectionCount(): number {
    return this.wss ? this.wss.clients.size : 0;
  }

  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      logger.info("WebSocket Signaling Server closed");
    }
  }
}
