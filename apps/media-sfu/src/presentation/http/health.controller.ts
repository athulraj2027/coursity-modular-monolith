import { Request, Response } from "express";
import { WorkerPool } from "@/infrastructure/mediasoup/WorkerPool";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { redis } from "@/infrastructure/redis/RedisClient";
import { env } from "@/config/env";

export const createHealthController = (
  workerPool: WorkerPool,
  sessionRegistry: ISessionRegistry
) => {
  return async (_req: Request, res: Response): Promise<void> => {
    const workerCount = workerPool.getWorkerCount();
    const isHealthy = workerCount > 0;

    const healthData = {
      status: isHealthy ? "healthy" : "degraded",
      service: "media-sfu",
      nodeId: env.NODE_ID,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      workers: {
        healthy: workerCount,
        configured: env.MEDIASOUP_NUM_WORKERS || "auto",
      },
      stats: {
        activeRooms: sessionRegistry.count(),
        activeConsumers: sessionRegistry.getTotalConsumersCount(),
        activeProducers: sessionRegistry.getTotalProducersCount(),
        activeTransports: sessionRegistry.getTotalTransportsCount(),
      },
      redisStatus: redis.status,
    };

    res.status(isHealthy ? 200 : 503).json(healthData);
  };
};
