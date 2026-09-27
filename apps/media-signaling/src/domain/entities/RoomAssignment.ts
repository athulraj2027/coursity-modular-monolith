export type RoomStatus = "ACTIVE" | "DRAINING" | "CLOSED";

export interface RoomAssignment {
  roomId: string;
  nodeId: string;
  wsUrl: string;
  httpUrl: string;
  assignedAt: number;
  expiresAt: number;
  status: RoomStatus;
}
