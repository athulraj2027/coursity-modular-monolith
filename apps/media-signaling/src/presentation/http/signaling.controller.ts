import { Router, Response, NextFunction } from "express";
import { AuthorizeJoinUseCase } from "@/application/session/AuthorizeJoinUseCase";
import { AllocateRoomUseCase } from "@/application/session/AllocateRoomUseCase";
import { ReleaseRoomUseCase } from "@/application/session/ReleaseRoomUseCase";
import { GetRoomAllocationUseCase } from "@/application/nodes/GetRoomAllocationUseCase";
import { AuthenticatedRequest, optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { ApiResponse } from "@/shared/types/response.types";
import { ValidationError } from "@/shared/errors/AppErrors";

export const createSignalingController = (
  authorizeJoinUseCase: AuthorizeJoinUseCase,
  allocateRoomUseCase: AllocateRoomUseCase,
  releaseRoomUseCase: ReleaseRoomUseCase,
  getRoomAllocationUseCase: GetRoomAllocationUseCase
): Router => {
  const router = Router();

  // POST /api/v1/signaling/join - Authorize user and get allocated SFU node + joinToken
  router.post("/join", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { classSessionId, token, role, displayName } = req.body;

      if (!classSessionId) {
        throw new ValidationError("classSessionId is required");
      }

      const authToken = token || (req.headers.authorization ? req.headers.authorization.substring(7) : undefined);

      const result = await authorizeJoinUseCase.execute({
        classSessionId,
        userToken: authToken,
        userId: req.user?.userId,
        role: role || (req.user?.role as any),
        displayName: displayName || req.user?.name,
      });

      return ApiResponse.success(res, result, "Joined session successfully");
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/allocate - Allocate room to least-loaded SFU node
  router.post("/allocate", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { classSessionId, region, forceReassign } = req.body;

      if (!classSessionId) {
        throw new ValidationError("classSessionId is required");
      }

      const result = await allocateRoomUseCase.execute({
        classSessionId,
        region,
        forceReassign: Boolean(forceReassign),
      });

      return ApiResponse.success(res, result, "Room allocated successfully");
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/signaling/rooms/:roomId - Query room allocation status
  router.get("/rooms/:roomId", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const result = await getRoomAllocationUseCase.execute(roomId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/signaling/rooms/:roomId - Release room allocation
  router.delete("/rooms/:roomId", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const { reason } = req.body || {};
      await releaseRoomUseCase.execute(roomId, reason);
      return ApiResponse.success(res, { roomId, released: true }, "Room released successfully");
    } catch (err) {
      next(err);
    }
  });

  return router;
};
