import {
  AIProviderEntity,
  AIModelEntity,
  AICredentialEntity,
  AIConfigVersionEntity,
  AgentConfigEntity,
  AIAuditLogEntity,
} from "../entities/ai-config.entities";

export interface IAIProviderRepository {
  findById(id: string): Promise<AIProviderEntity | null>;
  findBySlug(slug: string): Promise<AIProviderEntity | null>;
  findAll(): Promise<AIProviderEntity[]>;
  create(data: Omit<AIProviderEntity, "id" | "createdAt" | "updatedAt">): Promise<AIProviderEntity>;
  update(id: string, data: Partial<AIProviderEntity>): Promise<AIProviderEntity>;
}

export interface IAIModelRepository {
  findById(id: string): Promise<AIModelEntity | null>;
  findByProviderAndModelId(providerId: string, modelId: string): Promise<AIModelEntity | null>;
  findAll(filters?: { providerId?: string; type?: string }): Promise<AIModelEntity[]>;
  create(data: Omit<AIModelEntity, "id" | "createdAt" | "updatedAt">): Promise<AIModelEntity>;
  update(id: string, data: Partial<AIModelEntity>): Promise<AIModelEntity>;
}

export interface IAICredentialRepository {
  findById(id: string): Promise<AICredentialEntity | null>;
  findBySecretReference(ref: string): Promise<AICredentialEntity | null>;
  findAll(providerId?: string): Promise<AICredentialEntity[]>;
  create(data: Omit<AICredentialEntity, "id" | "createdAt" | "updatedAt">): Promise<AICredentialEntity>;
  update(id: string, data: Partial<AICredentialEntity>): Promise<AICredentialEntity>;
  delete(id: string): Promise<void>;
}

export interface IAIConfigVersionRepository {
  findById(id: string): Promise<AIConfigVersionEntity | null>;
  findByVersion(version: number): Promise<AIConfigVersionEntity | null>;
  findPublished(): Promise<AIConfigVersionEntity | null>;
  findDraft(): Promise<AIConfigVersionEntity | null>;
  findAll(): Promise<AIConfigVersionEntity[]>;
  getNextVersionNumber(): Promise<number>;
  createVersion(data: {
    version: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    name?: string;
    description?: string;
    publishedBy?: string;
  }): Promise<AIConfigVersionEntity>;
  saveDraftAgentConfigs(versionId: string, configs: Array<{
    agentType: string;
    modelId: string;
    credentialId: string;
    enabled?: boolean;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    customConfig?: Record<string, any>;
    fallbacks?: Array<{
      priority: number;
      modelId: string;
      credentialId: string;
      temperature?: number;
      customConfig?: Record<string, any>;
    }>;
  }>): Promise<AIConfigVersionEntity>;
  publishVersion(versionId: string, adminUserId: string): Promise<AIConfigVersionEntity>;
  rollbackToVersion(targetVersionId: string, adminUserId: string): Promise<AIConfigVersionEntity>;
}

export interface IAIAuditLogRepository {
  create(data: Omit<AIAuditLogEntity, "id" | "createdAt">): Promise<AIAuditLogEntity>;
  findAll(limit?: number): Promise<AIAuditLogEntity[]>;
}
