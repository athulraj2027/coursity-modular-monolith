import { Router } from "express";
import { InternalInterviewController } from "../controllers/internal-interview.controller";
import { internalAuthMiddleware } from "../middlewares/internal-auth.middleware";

export class InternalInterviewRoutes {
  public router: Router;

  constructor(private readonly controller: InternalInterviewController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(internalAuthMiddleware);

    // 1. Session Lifecycle Synchronization
    this.router.post("/sessions/:id/initialize", this.controller.initializeSession);
    this.router.post("/sessions/:id/start", this.controller.startSession);
    this.router.post("/sessions/:id/end", this.controller.endSession);
    this.router.post("/sessions/:id/abandon", this.controller.abandonSession);

    // 2. Realtime Transcript Ingestion & Metadata
    this.router.post("/sessions/:id/transcripts", this.controller.appendTranscript);
    this.router.patch("/sessions/:id/metadata", this.controller.updateMetadata);
  }
}
