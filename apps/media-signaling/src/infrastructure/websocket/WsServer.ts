import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseUrl } from "url";
import { WsMessageRouter } from "./WsMessageRouter";
import { ITokenService } from "@/domain/ports/ITokenService";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { REDIS_KEYS } from "@/config/constants";
import { logger } from "@/shared/logger/Logger";

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  role?: string;
  displayName?: string;
  roomId?: string;
  connectionId: string;
}

export class WsServer {
  private wss: WebSocketServer | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly roomSockets = new Map<string, Set<AuthenticatedWebSocket>>();
  private readonly roomUnsubscribers = new Map<string, () => void>();

  constructor(
    private readonly messageRouter: WsMessageRouter,
    private readonly tokenService: ITokenService,
    private readonly pubSubService: IPubSubService
  ) {}

  public initialize(server: HttpServer): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {
      const { pathname, query } = parseUrl(req.url || "", true);

      if (pathname === "/ws" || pathname === "/signaling") {
        let authContext: { userId?: string; role?: string; displayName?: string } | undefined;

        // Optional token authentication on WS upgrade
        const token = (query.token as string) || (req.headers["sec-websocket-protocol"] as string);
        if (token) {
          try {
            const decoded = this.tokenService.verifyToken<{
              userId?: string;
              id?: string;
              sub?: string;
              role?: string;
              name?: string;
            }>(token);
            authContext = {
              userId: decoded.userId || decoded.id || decoded.sub,
              role: decoded.role,
              displayName: decoded.name,
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
            authWs.displayName = authContext.displayName;
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
          displayName: ws.displayName,
          roomId: ws.roomId,
          setRoomId: (newRoomId: string) => this.assignSocketToRoom(ws, newRoomId),
        });
      });

      ws.on("close", (code, reason) => {
        logger.info(
          `Signaling Client disconnected [connId: ${ws.connectionId}] (code: ${code}, reason: ${reason.toString()})`
        );
        this.removeSocketFromRoom(ws);
      });

      ws.on("error", (error) => {
        logger.error(`WebSocket error on conn [${ws.connectionId}]:`, error);
        this.removeSocketFromRoom(ws);
      });
    });

    // Heartbeat ping-pong to detect dead connections
    this.pingInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((client) => {
        const authWs = client as AuthenticatedWebSocket;
        if (!authWs.isAlive) {
          logger.debug(`Terminating stale signaling connection [${authWs.connectionId}]`);
          this.removeSocketFromRoom(authWs);
          return authWs.terminate();
        }
        authWs.isAlive = false;
        authWs.ping();
      });
    }, 30000);

    logger.success("WebSocket Signaling Server attached to /ws & /signaling with PubSub Room Hub");
  }

  private async assignSocketToRoom(ws: AuthenticatedWebSocket, newRoomId: string): Promise<void> {
    if (ws.roomId === newRoomId) return;

    this.removeSocketFromRoom(ws);

    if (!newRoomId) return;

    ws.roomId = newRoomId;
    if (!this.roomSockets.has(newRoomId)) {
      this.roomSockets.set(newRoomId, new Set());

      // Subscribe to Redis PubSub for this room's events across cluster
      try {
        const unsub = await this.pubSubService.subscribe<{ type: string; data: unknown }>(
          REDIS_KEYS.ROOM_EVENTS_CHANNEL(newRoomId),
          (event) => this.broadcastToLocalRoom(newRoomId, event)
        );
        this.roomUnsubscribers.set(newRoomId, unsub);
        logger.info(`Subscribed to Redis room events channel for [${newRoomId}]`);
      } catch (err) {
        logger.error(`Failed to subscribe to Redis channel for room [${newRoomId}]:`, err);
      }
    }

    this.roomSockets.get(newRoomId)!.add(ws);
  }

  private removeSocketFromRoom(ws: AuthenticatedWebSocket): void {
    const roomId = ws.roomId;
    if (!roomId) return;

    const set = this.roomSockets.get(roomId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) {
        this.roomSockets.delete(roomId);
        const unsub = this.roomUnsubscribers.get(roomId);
        if (unsub) {
          unsub();
          this.roomUnsubscribers.delete(roomId);
          logger.info(`Unsubscribed from Redis room events channel for [${roomId}] (0 local clients)`);
        }
      }
    }
    ws.roomId = undefined;
  }

  public broadcastToLocalRoom(roomId: string, event: { type: string; data: unknown }): void {
    const sockets = this.roomSockets.get(roomId);
    if (!sockets || sockets.size === 0) return;

    const payload = JSON.stringify(event);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  public getActiveConnectionCount(): number {
    return this.wss ? this.wss.clients.size : 0;
  }

  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    for (const unsub of this.roomUnsubscribers.values()) {
      unsub();
    }
    this.roomUnsubscribers.clear();
    this.roomSockets.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
      logger.info("WebSocket Signaling Server closed");
    }
  }
}
