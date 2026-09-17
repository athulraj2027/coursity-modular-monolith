import { AIProviderType, AIProviderStatus, AICredentialStatus, AIAgentType } from "../../domain/entities/ai-config.entities";

export interface CreateAIProviderDto {
  slug: string;
  name: string;
  type: AIProviderType;
  status?: AIProviderStatus;
  metadata?: Record<string, any>;
}

export interface UpdateAIProviderDto {
  name?: string;
  status?: AIProviderStatus;
  metadata?: Record<string, any>;
}

export interface CreateAIModelDto {
  providerId: string;
  name: string;
  modelId: string;
  type: AIProviderType;
  status?: AIProviderStatus;
  metadata?: Record<string, any>;
}

export interface UpdateAIModelDto {
  name?: string;
  status?: AIProviderStatus;
  metadata?: Record<string, any>;
}

export interface CreateAICredentialDto {
  providerId: string;
  name: string;
  apiKey: string; // Plaintext passed in creation request, encrypted immediately
}

export interface RotateAICredentialDto {
  apiKey: string;
  name?: string;
}

export interface AgentFallbackInputDto {
  priority: number;
  modelId: string;
  credentialId: string;
  temperature?: number;
  customConfig?: Record<string, any>;
}

export interface AgentConfigInputDto {
  agentType: AIAgentType;
  modelId: string;
  credentialId: string;
  enabled?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  customConfig?: Record<string, any>;
  fallbacks?: AgentFallbackInputDto[];
}

export interface SaveDraftConfigDto {
  name?: string;
  description?: string;
  agentConfigs: AgentConfigInputDto[];
}

export interface PublishConfigDto {
  versionId: string;
}

export interface RollbackConfigDto {
  targetVersionId: string;
}
