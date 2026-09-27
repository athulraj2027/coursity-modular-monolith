import { NodeWithDetails } from "@/domain/entities/NodeStats";
import { IPlacementStrategy, PlacementOptions } from "./IPlacementStrategy";
import { NoAvailableNodesError } from "@/shared/errors/AppErrors";
import { logger } from "@/shared/logger/Logger";

export class LeastLoadedStrategy implements IPlacementStrategy {
  public selectNode(candidates: NodeWithDetails[], options?: PlacementOptions): NodeWithDetails {
    if (!candidates || candidates.length === 0) {
      throw new NoAvailableNodesError("No healthy SFU nodes available for placement");
    }

    const maxCpu = options?.maxCpuThresholdPercent ?? 90;

    // Filter candidate nodes below max CPU threshold first
    const eligible = candidates.filter(
      (c) => c.isHealthy && c.stats.cpuPercent <= maxCpu
    );

    const pool = eligible.length > 0 ? eligible : candidates.filter((c) => c.isHealthy);

    if (pool.length === 0) {
      throw new NoAvailableNodesError("All SFU nodes in cluster are unhealthy or unresponsive");
    }

    // Calculate dynamic load score for each node (lower is better)
    // score = (cpu% * 0.40) + (mem% * 0.20) + (activeRooms * 10 * 0.20) + (activeConsumers * 2 * 0.20)
    let bestNode = pool[0];
    let lowestScore = Number.MAX_SAFE_INTEGER;

    for (const candidate of pool) {
      const { stats } = candidate;
      const cpuScore = stats.cpuPercent * 0.4;
      const memScore = stats.memoryPercent * 0.2;
      const roomScore = Math.min(100, stats.activeRooms * 10) * 0.2;
      const consumerScore = Math.min(100, stats.activeConsumers * 2) * 0.2;
      
      const compositeScore = cpuScore + memScore + roomScore + consumerScore;
      candidate.score = compositeScore;

      if (compositeScore < lowestScore) {
        lowestScore = compositeScore;
        bestNode = candidate;
      }
    }

    logger.debug(
      `LeastLoadedStrategy selected SFU node [${bestNode.stats.nodeId}] (score: ${lowestScore.toFixed(1)}, CPU: ${bestNode.stats.cpuPercent}%, Rooms: ${bestNode.stats.activeRooms})`
    );

    return bestNode;
  }
}
