import { Router, Request, Response } from "express";
import { redis } from "@/infrastructure/redis/RedisClient";
import { ApiResponse } from "@/shared/types/response.types";
import { env } from "@/config/env";

export const createHealthController = (getActiveWsCount: () => number): Router => {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    let redisOk = false;
    try {
      const pong = await redis.ping();
      redisOk = pong === "PONG";
    } catch {
      redisOk = false;
    }

    const isHealthy = redisOk;

    const data = {
      status: isHealthy ? "healthy" : "degraded",
      service: env.SERVICE_NAME,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      activeWsConnections: getActiveWsCount(),
      dependencies: {
        redis: redisOk ? "connected" : "disconnected",
      },
    };

    return ApiResponse.success(res, data, "Service status check", isHealthy ? 200 : 503);
  });

  router.get("/live", (req: Request, res: Response) => {
    return ApiResponse.success(res, { status: "alive" });
  });

  router.get("/ready", async (req: Request, res: Response) => {
    try {
      await redis.ping();
      return ApiResponse.success(res, { status: "ready" });
    } catch {
      return ApiResponse.error(res, "Redis dependency unavailable", "SERVICE_UNAVAILABLE", 503);
    }
  });

  return router;
};
