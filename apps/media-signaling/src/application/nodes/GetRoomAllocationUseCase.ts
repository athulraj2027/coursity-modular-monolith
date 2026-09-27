import { IRoomRegistry } from "@/domain/ports/IRoomRegistry";
import { INodeStatsStore } from "@/domain/ports/INodeStatsStore";
import { RoomQueryResponseData } from "@/shared/types/ws-signaling.types";

export class GetRoomAllocationUseCase {
  constructor(
    private readonly roomRegistry: IRoomRegistry,
    private readonly nodeStatsStore: INodeStatsStore
  ) {}

  public async execute(classSessionId: string): Promise<RoomQueryResponseData> {
    const nodeId = await this.roomRegistry.getRoomNode(classSessionId);

    if (!nodeId) {
      return {
        classSessionId,
        allocated: false,
      };
    }

    const info = await this.nodeStatsStore.getNodeInfo(nodeId);

    return {
      classSessionId,
      allocated: true,
      nodeId,
      wsUrl: info?.wsUrl,
      httpUrl: info?.httpUrl,
    };
  }
}
