import { Router, Request, Response, NextFunction } from "express";
import { GetActiveNodesUseCase } from "@/application/nodes/GetActiveNodesUseCase";
import { INodeStatsStore } from "@/domain/ports/INodeStatsStore";
import { ApiResponse } from "@/shared/types/response.types";
import { NotFoundError } from "@/shared/errors/AppErrors";

export const createNodesController = (
  getActiveNodesUseCase: GetActiveNodesUseCase,
  nodeStatsStore: INodeStatsStore
): Router => {
  const router = Router();

  // GET /api/v1/nodes - Get cluster status & all active SFU nodes
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await getActiveNodesUseCase.execute();
      return ApiResponse.success(res, summary, "Cluster nodes retrieved successfully");
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/nodes/:nodeId - Get specific SFU node details
  router.get("/:nodeId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nodeId = Array.isArray(req.params.nodeId) ? req.params.nodeId[0] : req.params.nodeId;
      const stats = await nodeStatsStore.getNodeStats(nodeId);
      const info = await nodeStatsStore.getNodeInfo(nodeId);

      if (!stats) {
        throw new NotFoundError(`SFU Node with id '${nodeId}' not found or inactive`);
      }

      return ApiResponse.success(res, { stats, info });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
