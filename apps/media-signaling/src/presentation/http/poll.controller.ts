import { Router, Response, NextFunction } from "express";
import { CreatePollUseCase } from "@/application/poll/CreatePollUseCase";
import { VotePollUseCase } from "@/application/poll/VotePollUseCase";
import { EndPollUseCase } from "@/application/poll/EndPollUseCase";
import { GetActivePollUseCase } from "@/application/poll/GetActivePollUseCase";
import { AuthenticatedRequest, optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { ApiResponse } from "@/shared/types/response.types";
import { ValidationError } from "@/shared/errors/AppErrors";
import { Role } from "@/shared/types/ws-signaling.types";

export const createPollController = (
  createPollUseCase: CreatePollUseCase,
  votePollUseCase: VotePollUseCase,
  endPollUseCase: EndPollUseCase,
  getActivePollUseCase: GetActivePollUseCase
): Router => {
  const router = Router();

  // GET /api/v1/signaling/rooms/:roomId/poll - Get current active poll & user vote state
  router.get("/rooms/:roomId/poll", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const result = await getActivePollUseCase.execute(roomId, req.user?.userId);
      return ApiResponse.success(res, { poll: result });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/rooms/:roomId/poll - Teacher creates a live poll
  router.post("/rooms/:roomId/poll", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const { question, options, durationSeconds } = req.body;

      if (!question || !options) {
        throw new ValidationError("question and options are required");
      }

      const result = await createPollUseCase.execute({
        roomId,
        creatorId: req.user!.userId,
        creatorName: req.user!.name || "Teacher",
        role: (req.user?.role as Role) || "TEACHER",
        question,
        options,
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : undefined,
      });

      return ApiResponse.created(res, result, "Live poll created successfully");
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/rooms/:roomId/poll/:pollId/vote - Student votes in poll
  router.post("/rooms/:roomId/poll/:pollId/vote", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const pollId = Array.isArray(req.params.pollId) ? req.params.pollId[0] : req.params.pollId;
      const { optionId } = req.body;

      if (!optionId) {
        throw new ValidationError("optionId is required");
      }

      const userId = req.user?.userId || req.body.userId || `guest-${Math.random().toString(36).substring(2, 8)}`;

      const result = await votePollUseCase.execute({
        roomId,
        pollId,
        userId,
        optionId,
      });

      return ApiResponse.success(res, result, "Vote submitted successfully");
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/rooms/:roomId/poll/:pollId/end - Teacher ends poll early
  router.post("/rooms/:roomId/poll/:pollId/end", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const pollId = Array.isArray(req.params.pollId) ? req.params.pollId[0] : req.params.pollId;

      const result = await endPollUseCase.execute({
        roomId,
        pollId,
        userId: req.user!.userId,
        role: (req.user?.role as Role) || "TEACHER",
      });

      return ApiResponse.success(res, result, "Poll ended successfully");
    } catch (err) {
      next(err);
    }
  });

  return router;
};
