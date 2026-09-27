import { INodeStatsStore } from "@/domain/ports/INodeStatsStore";
import { NodeWithDetails } from "@/domain/entities/NodeStats";

export interface ClusterStatsSummary {
  totalNodes: number;
  healthyNodes: number;
  totalActiveRooms: number;
  totalActiveProducers: number;
  totalActiveConsumers: number;
  totalActiveTransports: number;
  averageCpuPercent: number;
  averageMemoryPercent: number;
  nodes: NodeWithDetails[];
}

export class GetActiveNodesUseCase {
  constructor(private readonly nodeStatsStore: INodeStatsStore) {}

  public async execute(): Promise<ClusterStatsSummary> {
    const nodes = await this.nodeStatsStore.getAllNodesWithStats();
    const healthyNodes = nodes.filter((n) => n.isHealthy);

    let totalActiveRooms = 0;
    let totalActiveProducers = 0;
    let totalActiveConsumers = 0;
    let totalActiveTransports = 0;
    let sumCpu = 0;
    let sumMem = 0;

    for (const node of healthyNodes) {
      totalActiveRooms += node.stats.activeRooms;
      totalActiveProducers += node.stats.activeProducers;
      totalActiveConsumers += node.stats.activeConsumers;
      totalActiveTransports += node.stats.activeTransports;
      sumCpu += node.stats.cpuPercent;
      sumMem += node.stats.memoryPercent;
    }

    const count = healthyNodes.length;

    return {
      totalNodes: nodes.length,
      healthyNodes: count,
      totalActiveRooms,
      totalActiveProducers,
      totalActiveConsumers,
      totalActiveTransports,
      averageCpuPercent: count > 0 ? Number((sumCpu / count).toFixed(1)) : 0,
      averageMemoryPercent: count > 0 ? Number((sumMem / count).toFixed(1)) : 0,
      nodes,
    };
  }
}
