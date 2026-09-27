export interface NodeStats {
  nodeId: string;
  publicIp: string;
  port: number;
  cpuPercent: number;
  memoryPercent: number;
  activeRooms: number;
  activeProducers: number;
  activeConsumers: number;
  activeTransports: number;
  numWorkers: number;
  lastHeartbeat: number;
}

export interface NodeInfo {
  nodeId: string;
  wsUrl: string;
  httpUrl: string;
  registeredAt?: number;
}

export interface NodeWithDetails {
  stats: NodeStats;
  info: NodeInfo;
  isHealthy: boolean;
  score: number;
}
