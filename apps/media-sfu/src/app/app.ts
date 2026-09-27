import express from "express";
import cors from "cors";
import { WorkerPool } from "@/infrastructure/mediasoup/WorkerPool";
import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { HeartbeatReporter } from "@/infrastructure/redis/HeartbeatReporter";
import { createHealthController } from "@/presentation/http/health.controller";
import { createAdminController } from "@/presentation/http/admin.controller";

export const createApp = (dependencies: {
  workerPool: WorkerPool;
  sessionRegistry: ISessionRegistry;
  heartbeatReporter: HeartbeatReporter;
}) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const healthHandler = createHealthController(
    dependencies.workerPool,
    dependencies.sessionRegistry
  );

  const adminController = createAdminController(
    dependencies.sessionRegistry,
    dependencies.heartbeatReporter
  );

  // Health and Metrics endpoints
  app.get("/health", healthHandler);
  app.get("/metrics", healthHandler);

  // Admin and Monitoring endpoints
  app.get("/admin/stats", adminController.getStats);
  app.get("/admin/rooms", adminController.getRooms);
  app.post("/admin/rooms/:roomId/terminate", adminController.terminateRoom);

  return app;
};
