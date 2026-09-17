import { Request, Response, NextFunction } from "express";
import { ManageProvidersUseCase } from "../../application/use-cases/manage-providers.usecase";
import { ManageModelsUseCase } from "../../application/use-cases/manage-models.usecase";
import { ManageCredentialsUseCase } from "../../application/use-cases/manage-credentials.usecase";
import { TestCredentialUseCase } from "../../application/use-cases/test-credential.usecase";
import { ManageConfigVersionUseCase } from "../../application/use-cases/manage-config-version.usecase";

export class AdminAIConfigController {
  constructor(
    private readonly manageProviders: ManageProvidersUseCase,
    private readonly manageModels: ManageModelsUseCase,
    private readonly manageCredentials: ManageCredentialsUseCase,
    private readonly testCredentialUseCase: TestCredentialUseCase,
    private readonly manageConfigVersion: ManageConfigVersionUseCase
  ) {}

  // 1. Providers
  getProviders = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = await this.manageProviders.listProviders();
      res.status(200).json({ success: true, data: providers });
    } catch (error) {
      next(error);
    }
  };

  getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.manageProviders.getProviderById(req.params.id as string);
      res.status(200).json({ success: true, data: provider });
    } catch (error) {
      next(error);
    }
  };

  createProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const created = await this.manageProviders.createProvider(req.body, adminId);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  updateProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const updated = await this.manageProviders.updateProvider(req.params.id as string, req.body, adminId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  // 2. Models
  getModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId, type } = req.query as { providerId?: string; type?: string };
      const models = await this.manageModels.listModels({ providerId, type });
      res.status(200).json({ success: true, data: models });
    } catch (error) {
      next(error);
    }
  };

  createModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const created = await this.manageModels.createModel(req.body, adminId);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  updateModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const updated = await this.manageModels.updateModel(req.params.id as string, req.body, adminId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  // 3. Credentials
  getCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { providerId } = req.query as { providerId?: string };
      const credentials = await this.manageCredentials.listCredentials(providerId);
      res.status(200).json({ success: true, data: credentials });
    } catch (error) {
      next(error);
    }
  };

  createCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const created = await this.manageCredentials.createCredential(req.body, adminId);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  rotateCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const rotated = await this.manageCredentials.rotateCredential(req.params.id as string, req.body, adminId);
      res.status(200).json({ success: true, data: rotated });
    } catch (error) {
      next(error);
    }
  };

  revokeCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const result = await this.manageCredentials.revokeCredential(req.params.id as string, adminId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  testCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.testCredentialUseCase.testCredentialById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // 4. Configuration Versions & Agent Matrix
  getConfig = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.manageConfigVersion.getActiveAndDraft();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const saved = await this.manageConfigVersion.saveDraft(req.body, adminId);
      res.status(200).json({ success: true, data: saved });
    } catch (error) {
      next(error);
    }
  };

  publishConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const { versionId } = req.body;
      const published = await this.manageConfigVersion.publish(versionId, adminId);
      res.status(200).json({ success: true, data: published });
    } catch (error) {
      next(error);
    }
  };

  rollbackConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user?.id || "admin";
      const { targetVersionId } = req.body;
      const rolledBack = await this.manageConfigVersion.rollback(targetVersionId, adminId);
      res.status(200).json({ success: true, data: rolledBack });
    } catch (error) {
      next(error);
    }
  };

  getVersions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const versions = await this.manageConfigVersion.listVersions();
      res.status(200).json({ success: true, data: versions });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const logs = await this.manageConfigVersion.listAuditLogs(limit);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };
}
