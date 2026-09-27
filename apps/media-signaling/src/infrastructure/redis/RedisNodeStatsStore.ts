import { INodeStatsStore } from "@/domain/ports/INodeStatsStore";
import { NodeStats, NodeInfo, NodeWithDetails } from "@/domain/entities/NodeStats";
import { redis } from "./RedisClient";
import { REDIS_KEYS } from "@/config/constants";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

export class RedisNodeStatsStore implements INodeStatsStore {
  public async getActiveNodeIds(): Promise<string[]> {
    try {
      const nodes = await redis.smembers(REDIS_KEYS.ACTIVE_NODES);
      return nodes || [];
    } catch (err) {
      logger.error("RedisNodeStatsStore.getActiveNodeIds failed:", err);
      return [];
    }
  }

  public async getNodeStats(nodeId: string): Promise<NodeStats | null> {
    try {
      const key = REDIS_KEYS.NODE_STATS(nodeId);
      const raw = await redis.hgetall(key);

      if (!raw || Object.keys(raw).length === 0) {
        return null;
      }

      return {
        nodeId: raw.nodeId || nodeId,
        publicIp: raw.publicIp || "127.0.0.1",
        port: parseInt(raw.port || "5000", 10),
        cpuPercent: parseFloat(raw.cpuPercent || "0"),
        memoryPercent: parseFloat(raw.memoryPercent || "0"),
        activeRooms: parseInt(raw.activeRooms || "0", 10),
        activeProducers: parseInt(raw.activeProducers || "0", 10),
        activeConsumers: parseInt(raw.activeConsumers || "0", 10),
        activeTransports: parseInt(raw.activeTransports || "0", 10),
        numWorkers: parseInt(raw.numWorkers || "1", 10),
        lastHeartbeat: parseInt(raw.lastHeartbeat || "0", 10),
      };
    } catch (err) {
      logger.error(`RedisNodeStatsStore.getNodeStats failed for node ${nodeId}:`, err);
      return null;
    }
  }

  public async getNodeInfo(nodeId: string): Promise<NodeInfo | null> {
    try {
      const key = REDIS_KEYS.NODE_INFO(nodeId);
      const raw = await redis.hgetall(key);

      if (!raw || Object.keys(raw).length === 0) {
        // Fallback default construct if info hash expired/missing
        return {
          nodeId,
          wsUrl: `ws://localhost:5000/ws`,
          httpUrl: `http://localhost:5000`,
        };
      }

      return {
        nodeId: raw.nodeId || nodeId,
        wsUrl: raw.wsUrl,
        httpUrl: raw.httpUrl,
        registeredAt: raw.registeredAt ? parseInt(raw.registeredAt, 10) : undefined,
      };
    } catch (err) {
      logger.error(`RedisNodeStatsStore.getNodeInfo failed for node ${nodeId}:`, err);
      return null;
    }
  }

  public async getAllNodesWithStats(): Promise<NodeWithDetails[]> {
    const nodeIds = await this.getActiveNodeIds();
    const results: NodeWithDetails[] = [];
    const now = Date.now();

    for (const nodeId of nodeIds) {
      const stats = await this.getNodeStats(nodeId);
      const info = await this.getNodeInfo(nodeId);

      if (stats && info) {
        const isHealthy = now - stats.lastHeartbeat <= env.HEARTBEAT_TIMEOUT_MS;
        results.push({
          stats,
          info,
          isHealthy,
          score: 0,
        });
      }
    }

    return results;
  }

  public async getHealthyNodes(): Promise<NodeWithDetails[]> {
    const all = await this.getAllNodesWithStats();
    return all.filter((node) => node.isHealthy);
  }
}
