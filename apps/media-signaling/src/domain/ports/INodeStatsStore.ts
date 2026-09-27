import { NodeStats, NodeInfo, NodeWithDetails } from "../entities/NodeStats";

export interface INodeStatsStore {
  getActiveNodeIds(): Promise<string[]>;
  getNodeStats(nodeId: string): Promise<NodeStats | null>;
  getNodeInfo(nodeId: string): Promise<NodeInfo | null>;
  getAllNodesWithStats(): Promise<NodeWithDetails[]>;
  getHealthyNodes(): Promise<NodeWithDetails[]>;
}
