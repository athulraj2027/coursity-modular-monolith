import * as mediasoup from "mediasoup";
import type { Worker, Router } from "mediasoup/node/lib/types";
import { mediasoupConfig } from "@/config/mediasoup.config";
import { logger } from "@/shared/logger/Logger";
import { WorkerPoolExhaustedError } from "@/shared/errors/AppErrors";

interface WorkerEntry {
  worker: Worker;
  index: number;
  routerCount: number;
}

export class WorkerPool {
  private workers: WorkerEntry[] = [];
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const count = mediasoupConfig.numWorkers;
    logger.info(`Initializing Mediasoup WorkerPool with ${count} workers...`);

    for (let i = 0; i < count; i++) {
      await this.spawnWorker(i);
    }

    this.isInitialized = true;
    logger.success(`Mediasoup WorkerPool ready: ${this.workers.length} active workers.`);
  }

  private async spawnWorker(index: number): Promise<WorkerEntry> {
    const worker = await mediasoup.createWorker({
      logLevel: mediasoupConfig.workerSettings.logLevel,
      logTags: mediasoupConfig.workerSettings.logTags,
      rtcMinPort: mediasoupConfig.workerSettings.rtcMinPort,
      rtcMaxPort: mediasoupConfig.workerSettings.rtcMaxPort,
    });

    worker.on("died", (error) => {
      logger.error(`Mediasoup worker #${index} died [pid:${worker.pid}]:`, error);
      // Remove dead worker from active pool
      this.workers = this.workers.filter((w) => w.worker.pid !== worker.pid);
      // Attempt to respawn worker after delay
      setTimeout(() => {
        logger.info(`Respawning Mediasoup worker #${index}...`);
        this.spawnWorker(index).catch((err) => {
          logger.error(`Failed to respawn worker #${index}:`, err);
        });
      }, 2000);
    });

    const entry: WorkerEntry = {
      worker,
      index,
      routerCount: 0,
    };

    this.workers.push(entry);
    logger.debug(`Spawned Mediasoup Worker #${index} [pid:${worker.pid}]`);
    return entry;
  }

  public async createRouter(): Promise<{ router: Router; workerIndex: number }> {
    if (this.workers.length === 0) {
      throw new WorkerPoolExhaustedError("No healthy Mediasoup workers available in pool");
    }

    // Pick least-loaded worker by active router count
    const leastLoaded = this.workers.reduce((best, current) =>
      current.routerCount < best.routerCount ? current : best
    );

    const router = await leastLoaded.worker.createRouter({
      mediaCodecs: mediasoupConfig.routerMediaCodecs,
    });

    leastLoaded.routerCount++;

    router.observer.on("close", () => {
      leastLoaded.routerCount = Math.max(0, leastLoaded.routerCount - 1);
      logger.debug(`Router closed on worker #${leastLoaded.index}. Active routers: ${leastLoaded.routerCount}`);
    });

    return {
      router,
      workerIndex: leastLoaded.index,
    };
  }

  public getWorkerCount(): number {
    return this.workers.length;
  }

  public async close(): Promise<void> {
    logger.info("Closing all Mediasoup workers...");
    for (const { worker } of this.workers) {
      if (!worker.died) {
        worker.close();
      }
    }
    this.workers = [];
    this.isInitialized = false;
  }
}
