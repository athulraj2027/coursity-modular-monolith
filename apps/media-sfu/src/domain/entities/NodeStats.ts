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
