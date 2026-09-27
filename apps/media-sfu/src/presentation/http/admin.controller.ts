import { Request, Response } from "express";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { HeartbeatReporter } from "@/infrastructure/redis/HeartbeatReporter";
import { logger } from "@/shared/logger/Logger";

export const createAdminController = (
  sessionRegistry: ISessionRegistry,
  heartbeatReporter: HeartbeatReporter
) => {
  return {
    getStats: async (_req: Request, res: Response): Promise<void> => {
      const stats = await heartbeatReporter.sendCurrentStats();
      res.json({ success: true, data: stats });
    },

    getRooms: (_req: Request, res: Response): void => {
      const sessions = sessionRegistry.getAll().map((session) => ({
        roomId: session.roomId,
        createdAt: session.createdAt,
        participantCount: session.participants.size,
        activeProducersCount: session.getActiveProducers().length,
        workerIndex: session.workerIndex,
        participants: Array.from(session.participants.values()).map((p) => ({
          userId: p.userId,
          role: p.role,
          displayName: p.displayName,
          joinedAt: p.joinedAt,
          transportsCount: p.transports.size,
          producersCount: p.producers.size,
          consumersCount: p.consumers.size,
        })),
      }));

      res.json({ success: true, count: sessions.length, data: sessions });
    },

    terminateRoom: (req: Request<{ roomId: string }>, res: Response): void => {
      const { roomId } = req.params;
      const session = sessionRegistry.get(roomId);

      if (!session) {
        res.status(404).json({ success: false, message: "Room not found" });
        return;
      }

      session.broadcast("session:ended", { reason: "Admin terminated room" });
      sessionRegistry.delete(roomId);
      logger.warn(`Admin manually terminated room: ${roomId}`);

      res.json({ success: true, message: `Room ${roomId} terminated` });
    },
  };
};
