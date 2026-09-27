import { IRoomRegistry } from "@/domain/ports/IRoomRegistry";
import { IPubSubService } from "@/domain/ports/IPubSubService";
import { REDIS_KEYS } from "@/config/constants";
import { logger } from "@/shared/logger/Logger";

export class ReleaseRoomUseCase {
  constructor(
    private readonly roomRegistry: IRoomRegistry,
    private readonly pubSubService: IPubSubService
  ) {}

  public async execute(roomId: string, reason?: string): Promise<void> {
    const assignedNode = await this.roomRegistry.getRoomNode(roomId);

    await this.roomRegistry.releaseRoom(roomId);

    if (assignedNode) {
      await this.pubSubService.publish(REDIS_KEYS.PUBSUB_CHANNEL, {
        event: "session:released",
        roomId,
        nodeId: assignedNode,
        reason: reason || "NORMAL_CLOSURE",
        timestamp: Date.now(),
      });
    }

    logger.info(`Released room [${roomId}] from registry (node was: ${assignedNode || "none"})`);
  }
}
