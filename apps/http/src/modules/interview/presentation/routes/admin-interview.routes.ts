import { Router } from "express";
import { AdminInterviewController } from "../controllers/admin-interview.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export class AdminInterviewRoutes {
  public router: Router;

  constructor(private readonly controller: AdminInterviewController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware);
    this.router.use(isBlockedMiddleware);
    this.router.use(requireRoles("ADMIN"));

    // 1. Session Management & Inspection (7 routes)
    this.router.get("/sessions", this.controller.getSessions);
    this.router.get("/sessions/:id", this.controller.getSessionById);
    this.router.get("/sessions/:id/transcripts", this.controller.getSessionTranscripts);
    this.router.get("/sessions/:id/recording", this.controller.getSessionRecording);
    this.router.patch("/sessions/:id/decision", this.controller.overrideDecision);
    this.router.patch("/sessions/:id/evaluation", this.controller.adjustEvaluation);
    this.router.get("/sessions/:id/audit", this.controller.getSessionAudit);

    // 2. Analytics (3 routes)
    this.router.get("/analytics/overview", this.controller.getAnalyticsOverview);
    this.router.get("/analytics/timeseries", this.controller.getAnalyticsTimeseries);
    this.router.get("/analytics/templates/:templateId", this.controller.getTemplateAnalytics);

    // 3. Template Management & Versioning (6 routes)
    this.router.post("/templates", this.controller.createTemplate);
    this.router.get("/templates", this.controller.getTemplates);
    this.router.get("/templates/:id", this.controller.getTemplateById);
    this.router.patch("/templates/:id", this.controller.updateTemplate);
    this.router.patch("/templates/:id/status", this.controller.toggleTemplateStatus);
    this.router.get("/templates/:id/versions", this.controller.getTemplateVersions);
  }
}
