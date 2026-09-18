import { Router } from "express";
import { CandidateInterviewController } from "../controllers/candidate-interview.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { restrictPassedInterviewMiddleware } from "../middlewares/restrict-passed-interview.middleware";

export class CandidateInterviewRoutes {
  public router: Router;

  constructor(private readonly controller: CandidateInterviewController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 1. Template Browsing (Public / Open)
    this.router.get("/templates", this.controller.getTemplates);
    this.router.get("/templates/:slug", this.controller.getTemplateBySlug);

    // 2. Protected Candidate Session Lifecycle
    this.router.use(authMiddleware);
    this.router.use(isBlockedMiddleware);

    // Create & List Sessions
    this.router.post("/sessions", restrictPassedInterviewMiddleware, this.controller.createSession);
    this.router.get("/my-interviews", this.controller.getMyInterviews);

    // Specific Session Endpoints
    this.router.get("/sessions/:id", this.controller.getSession);
    this.router.post("/sessions/:id/start", restrictPassedInterviewMiddleware, this.controller.startSession);
    this.router.post("/sessions/:id/realtime-token", restrictPassedInterviewMiddleware, this.controller.getRealtimeToken);

    // Transcripts
    this.router.get("/sessions/:id/transcripts", this.controller.getTranscripts);
    this.router.get("/sessions/:id/transcripts/latest", this.controller.getLatestTranscripts);

    // Completion & Cancellation
    this.router.post("/sessions/:id/complete", this.controller.completeSession);
    this.router.post("/sessions/:id/cancel", this.controller.cancelSession);

    // Reports & Recordings
    this.router.get("/sessions/:id/report", this.controller.getReport);
    this.router.get("/sessions/:id/recording", this.controller.getRecording);
  }
}
