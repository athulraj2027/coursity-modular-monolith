import { IRoomRegistry } from "@/domain/ports/IRoomRegistry";
import { INodeStatsStore } from "@/domain/ports/INodeStatsStore";
import { IPlacementStrategy } from "../placement/IPlacementStrategy";
import { AllocateRoomResponseData } from "@/shared/types/ws-signaling.types";
import { NoAvailableNodesError } from "@/shared/errors/AppErrors";
import { env } from "@/config/env";
import { logger } from "@/shared/logger/Logger";

export interface AllocateRoomInput {
  classSessionId: string;
  region?: string;
  forceReassign?: boolean;
}

export class AllocateRoomUseCase {
  constructor(
    private readonly roomRegistry: IRoomRegistry,
    private readonly nodeStatsStore: INodeStatsStore,
    private readonly placementStrategy: IPlacementStrategy
  ) {}

  public async execute(input: AllocateRoomInput): Promise<AllocateRoomResponseData> {
    const { classSessionId, region, forceReassign } = input;

    // 1. Check if room is already allocated to a live SFU node
    if (!forceReassign) {
      const existingNodeId = await this.roomRegistry.getRoomNode(classSessionId);

      if (existingNodeId) {
        const stats = await this.nodeStatsStore.getNodeStats(existingNodeId);
        const info = await this.nodeStatsStore.getNodeInfo(existingNodeId);

        // Verify if the previously assigned node is still healthy
        const isHealthy = Boolean(
          stats && Date.now() - stats.lastHeartbeat <= env.HEARTBEAT_TIMEOUT_MS
        );

        if (isHealthy && info) {
          // Slide TTL on existing active room
          await this.roomRegistry.refreshRoomTtl(classSessionId, env.ROOM_TTL_SECONDS);

          return {
            classSessionId,
            nodeId: existingNodeId,
            wsUrl: info.wsUrl,
            httpUrl: info.httpUrl,
            isNewAllocation: false,
          };
        } else {
          logger.warn(
            `Room [${classSessionId}] was assigned to dead/stale node [${existingNodeId}]. Reallocating...`
          );
        }
      }
    }

    // 2. Fetch all healthy candidates
    const healthyCandidates = await this.nodeStatsStore.getHealthyNodes();

    if (healthyCandidates.length === 0) {
      throw new NoAvailableNodesError(
        "No healthy SFU nodes currently available to host this room"
      );
    }

    // 3. Select optimal node using placement strategy
    const selected = this.placementStrategy.selectNode(healthyCandidates, {
      preferredRegion: region,
    });

    // 4. Save assignment in Redis registry
    await this.roomRegistry.assignRoomToNode(
      classSessionId,
      selected.stats.nodeId,
      env.ROOM_TTL_SECONDS
    );

    logger.success(
      `Allocated room [${classSessionId}] -> SFU node [${selected.stats.nodeId}] (ws: ${selected.info.wsUrl})`
    );

    return {
      classSessionId,
      nodeId: selected.stats.nodeId,
      wsUrl: selected.info.wsUrl,
      httpUrl: selected.info.httpUrl,
      isNewAllocation: true,
    };
  }
}
