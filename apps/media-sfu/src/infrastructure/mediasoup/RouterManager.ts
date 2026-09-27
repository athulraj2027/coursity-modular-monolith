import type { Router } from "mediasoup/node/lib/types";
import { WorkerPool } from "./WorkerPool";
import { logger } from "@/shared/logger/Logger";

export class RouterManager {
  private routers = new Map<string, Router>();

  constructor(private readonly workerPool: WorkerPool) {}

  public async getOrCreateRouter(roomId: string): Promise<{ router: Router; workerIndex: number }> {
    const existing = this.routers.get(roomId);
    if (existing && !existing.closed) {
      return { router: existing, workerIndex: -1 };
    }

    const { router, workerIndex } = await this.workerPool.createRouter();
    this.routers.set(roomId, router);

    router.observer.on("close", () => {
      this.routers.delete(roomId);
      logger.info(`Router for room ${roomId} deleted from RouterManager`);
    });

    logger.info(`Allocated new Mediasoup Router for room: ${roomId} on Worker #${workerIndex}`);
    return { router, workerIndex };
  }

  public getRouter(roomId: string): Router | undefined {
    return this.routers.get(roomId);
  }

  public deleteRouter(roomId: string): void {
    const router = this.routers.get(roomId);
    if (router && !router.closed) {
      router.close();
    }
    this.routers.delete(roomId);
  }

  public getActiveRouterCount(): number {
    return this.routers.size;
  }
}
