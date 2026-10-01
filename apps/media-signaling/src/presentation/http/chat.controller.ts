import { Router, Response, NextFunction } from "express";
import { SendCommentUseCase } from "@/application/chat/SendCommentUseCase";
import { GetChatHistoryUseCase } from "@/application/chat/GetChatHistoryUseCase";
import { PinCommentUseCase } from "@/application/chat/PinCommentUseCase";
import { DeleteCommentUseCase } from "@/application/chat/DeleteCommentUseCase";
import { AuthenticatedRequest, optionalAuth, requireAuth } from "../middlewares/auth.middleware";
import { ApiResponse } from "@/shared/types/response.types";
import { ValidationError } from "@/shared/errors/AppErrors";
import { Role } from "@/shared/types/ws-signaling.types";

export const createChatController = (
  sendCommentUseCase: SendCommentUseCase,
  getChatHistoryUseCase: GetChatHistoryUseCase,
  pinCommentUseCase: PinCommentUseCase,
  deleteCommentUseCase: DeleteCommentUseCase
): Router => {
  const router = Router();

  // GET /api/v1/signaling/rooms/:roomId/chat - Fetch recent chat history
  router.get("/rooms/:roomId/chat", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await getChatHistoryUseCase.execute(roomId, limit);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/rooms/:roomId/chat - Post a live comment
  router.post("/rooms/:roomId/chat", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const { message, displayName, avatarUrl, pinned } = req.body;

      if (!message) {
        throw new ValidationError("message is required");
      }

      const userId = req.user?.userId || `guest-${Math.random().toString(36).substring(2, 8)}`;
      const role = (req.user?.role as Role) || "STUDENT";
      const userDisplayName = displayName || req.user?.name || (role === "TEACHER" ? "Teacher" : "Student");

      const result = await sendCommentUseCase.execute({
        roomId,
        userId,
        displayName: userDisplayName,
        role,
        message,
        avatarUrl,
        pinned,
      });

      return ApiResponse.created(res, result, "Comment posted successfully");
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/signaling/rooms/:roomId/chat/pin - Pin or unpin a comment (Teacher/Admin only)
  router.post("/rooms/:roomId/chat/pin", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const { commentId, pinned } = req.body;

      if (!commentId) {
        throw new ValidationError("commentId is required");
      }

      const result = await pinCommentUseCase.execute({
        roomId,
        commentId,
        pinned: pinned !== false,
        userId: req.user!.userId,
        role: (req.user?.role as Role) || "STUDENT",
      });

      return ApiResponse.success(res, result, pinned !== false ? "Comment pinned" : "Comment unpinned");
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/signaling/rooms/:roomId/chat/:commentId - Delete a comment
  router.delete("/rooms/:roomId/chat/:commentId", requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
      const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

      const success = await deleteCommentUseCase.execute({
        roomId,
        commentId,
        userId: req.user!.userId,
        role: (req.user?.role as Role) || "STUDENT",
      });

      return ApiResponse.success(res, { commentId, deleted: success }, "Comment deleted successfully");
    } catch (err) {
      next(err);
    }
  });

  return router;
};
