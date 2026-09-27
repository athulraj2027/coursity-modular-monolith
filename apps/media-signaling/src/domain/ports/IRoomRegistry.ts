export interface IRoomRegistry {
  getRoomNode(roomId: string): Promise<string | null>;
  assignRoomToNode(roomId: string, nodeId: string, ttlSeconds?: number): Promise<void>;
  releaseRoom(roomId: string): Promise<void>;
  refreshRoomTtl(roomId: string, ttlSeconds?: number): Promise<void>;
  getAllActiveRooms(): Promise<string[]>;
}
