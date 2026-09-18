import { Router } from "express";
import { InternalAIConfigController } from "../controllers/internal-ai-config.controller";
import { internalAuthMiddleware } from "@/modules/interview/presentation/middlewares/internal-auth.middleware";

export class InternalAIConfigRoutes {
  public router: Router;

  constructor(private readonly controller: InternalAIConfigController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(internalAuthMiddleware);

    // Endpoint for apps/ai-interview to retrieve decrypted runtime configuration
    this.router.get("/published", this.controller.getPublishedConfigHandler);
  }
}
