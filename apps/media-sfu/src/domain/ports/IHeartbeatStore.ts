import { NodeStats } from "../entities/NodeStats";

export interface IHeartbeatStore {
  publishHeartbeat(stats: NodeStats): Promise<void>;
  registerNode(nodeId: string, nodeInfo: { wsUrl: string; httpUrl: string }): Promise<void>;
  unregisterNode(nodeId: string): Promise<void>;
}
