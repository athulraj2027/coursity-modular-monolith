import { Router } from "express";
import { AdminAIConfigController } from "../controllers/admin-ai-config.controller";
import authMiddleware from "@/app/middlewares/auth.middleware";
import { isBlockedMiddleware } from "@/app/middlewares/is-blocked.middleware";
import { requireRoles } from "@/app/middlewares/role.middleware";

export class AdminAIConfigRoutes {
  public router: Router;

  constructor(private readonly controller: AdminAIConfigController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware);
    this.router.use(isBlockedMiddleware);
    this.router.use(requireRoles("ADMIN"));

    // 1. Providers (4 routes)
    this.router.get("/providers", this.controller.getProviders);
    this.router.post("/providers", this.controller.createProvider);
    this.router.get("/providers/:id", this.controller.getProviderById);
    this.router.patch("/providers/:id", this.controller.updateProvider);

    // 2. Models (3 routes)
    this.router.get("/models", this.controller.getModels);
    this.router.post("/models", this.controller.createModel);
    this.router.patch("/models/:id", this.controller.updateModel);

    // 3. Credentials (5 routes)
    this.router.get("/credentials", this.controller.getCredentials);
    this.router.post("/credentials", this.controller.createCredential);
    this.router.patch("/credentials/:id", this.controller.rotateCredential);
    this.router.delete("/credentials/:id", this.controller.revokeCredential);
    this.router.post("/credentials/:id/test", this.controller.testCredential);

    // 4. Configuration Versions & Agents (6 routes)
    this.router.get("/config", this.controller.getConfig);
    this.router.post("/config/draft", this.controller.saveDraft);
    this.router.post("/config/publish", this.controller.publishConfig);
    this.router.post("/config/rollback", this.controller.rollbackConfig);
    this.router.get("/config/versions", this.controller.getVersions);
    this.router.get("/audit", this.controller.getAuditLogs);
  }
}
