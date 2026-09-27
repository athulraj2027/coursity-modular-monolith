import os from "os";
import { redis } from "./RedisClient";
import { IHeartbeatStore } from "@/domain/ports/IHeartbeatStore";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { NodeStats } from "@/domain/entities/NodeStats";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

export class HeartbeatReporter implements IHeartbeatStore {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly sessionRegistry: ISessionRegistry,
    private readonly getWorkerCount: () => number
  ) {}

  public start(): void {
    if (this.timer) return;

    logger.info(
      `Starting Node Heartbeat Reporter (Node ID: ${env.NODE_ID}, Interval: ${env.HEARTBEAT_INTERVAL_MS}ms)`
    );

    // Initial publish
    this.sendCurrentStats().catch((err) => {
      logger.warn("Initial heartbeat publish failed:", err?.message || err);
    });

    this.timer = setInterval(() => {
      this.sendCurrentStats().catch((err) => {
        logger.warn("Periodic heartbeat publish failed:", err?.message || err);
      });
    }, env.HEARTBEAT_INTERVAL_MS);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info("Stopped Node Heartbeat Reporter");
    }
  }

  public async registerNode(nodeId: string, nodeInfo: { wsUrl: string; httpUrl: string }): Promise<void> {
    try {
      const multi = redis.multi();
      multi.sadd("sfu:nodes:active", nodeId);
      multi.hset(`sfu:node:${nodeId}:info`, {
        nodeId,
        wsUrl: nodeInfo.wsUrl,
        httpUrl: nodeInfo.httpUrl,
        registeredAt: Date.now().toString(),
      });
      await multi.exec();
      logger.success(`Registered SFU node [${nodeId}] with Redis cluster`);
    } catch (err) {
      logger.error(`Failed to register node in Redis:`, err);
    }
  }

  public async unregisterNode(nodeId: string): Promise<void> {
    try {
      const multi = redis.multi();
      multi.srem("sfu:nodes:active", nodeId);
      multi.del(`sfu:node:${nodeId}:info`);
      multi.del(`sfu:node:${nodeId}:stats`);
      await multi.exec();
      logger.info(`Unregistered SFU node [${nodeId}] from Redis cluster`);
    } catch (err) {
      logger.warn(`Failed to unregister node from Redis:`, err);
    }
  }

  public async publishHeartbeat(stats: NodeStats): Promise<void> {
    const key = `sfu:node:${stats.nodeId}:stats`;
    const ttlSeconds = Math.ceil((env.HEARTBEAT_INTERVAL_MS * 2.5) / 1000);

    const multi = redis.multi();
    multi.hset(key, {
      nodeId: stats.nodeId,
      publicIp: stats.publicIp,
      port: stats.port.toString(),
      cpuPercent: stats.cpuPercent.toFixed(1),
      memoryPercent: stats.memoryPercent.toFixed(1),
      activeRooms: stats.activeRooms.toString(),
      activeProducers: stats.activeProducers.toString(),
      activeConsumers: stats.activeConsumers.toString(),
      activeTransports: stats.activeTransports.toString(),
      numWorkers: stats.numWorkers.toString(),
      lastHeartbeat: stats.lastHeartbeat.toString(),
    });
    multi.expire(key, ttlSeconds);
    multi.sadd("sfu:nodes:active", stats.nodeId);
    await multi.exec();
  }

  public async sendCurrentStats(): Promise<NodeStats> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const memPercent = (memoryUsage.rss / totalMemory) * 100;

    // CPU estimation via load average (on unix) or fallback
    const cpus = os.cpus();
    const cpuLoad = os.loadavg()[0] || 0;
    const cpuPercent = Math.min(100, Math.max(0, (cpuLoad / Math.max(1, cpus.length)) * 100));

    const stats: NodeStats = {
      nodeId: env.NODE_ID,
      publicIp: env.MEDIASOUP_ANNOUNCED_IP,
      port: env.PORT,
      cpuPercent: isNaN(cpuPercent) ? 0 : cpuPercent,
      memoryPercent: isNaN(memPercent) ? 0 : memPercent,
      activeRooms: this.sessionRegistry.count(),
      activeProducers: this.sessionRegistry.getTotalProducersCount(),
      activeConsumers: this.sessionRegistry.getTotalConsumersCount(),
      activeTransports: this.sessionRegistry.getTotalTransportsCount(),
      numWorkers: this.getWorkerCount(),
      lastHeartbeat: Date.now(),
    };

    if (redis.status === "ready" || redis.status === "connect") {
      await this.publishHeartbeat(stats);
    }

    return stats;
  }
}
