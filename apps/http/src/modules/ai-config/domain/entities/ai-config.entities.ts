export type AIProviderType = "LLM" | "STT" | "TTS";
export type AIProviderStatus = "ACTIVE" | "INACTIVE" | "DEPRECATED";
export type AICredentialStatus = "ACTIVE" | "REVOKED" | "EXPIRED";
export type AIAgentType =
  | "SUPERVISOR"
  | "INTERVIEW_PLANNER"
  | "QUESTION_GENERATOR"
  | "ANSWER_ANALYZER"
  | "EVIDENCE_EXTRACTOR"
  | "FOLLOW_UP"
  | "DIFFICULTY_ADAPTER"
  | "CONVERSATION_QUALITY"
  | "EVALUATOR"
  | "REPORT_GENERATOR"
  | "FEEDBACK"
  | "INTEGRITY";

export type AIConfigVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AIProviderEntity {
  id: string;
  slug: string;
  name: string;
  type: AIProviderType;
  status: AIProviderStatus;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModelEntity {
  id: string;
  providerId: string;
  name: string;
  modelId: string;
  type: AIProviderType;
  status: AIProviderStatus;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AICredentialEntity {
  id: string;
  providerId: string;
  name: string;
  secretReference: string;
  lastFour: string;
  status: AICredentialStatus;
  lastUsedAt?: Date | null;
  lastTestedAt?: Date | null;
  lastTestStatus?: string | null;
  lastTestLatency?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentFallbackConfigEntity {
  id: string;
  agentConfigId: string;
  priority: number;
  modelId: string;
  credentialId: string;
  temperature?: number | null;
  customConfig?: Record<string, any> | null;
  createdAt: Date;
  model?: AIModelEntity;
  credential?: AICredentialEntity;
}

export interface AgentConfigEntity {
  id: string;
  versionId: string;
  agentType: AIAgentType;
  modelId: string;
  credentialId: string;
  enabled: boolean;
  temperature: number;
  maxTokens?: number | null;
  systemPrompt?: string | null;
  customConfig?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  model?: AIModelEntity;
  credential?: AICredentialEntity;
  fallbackConfigs?: AgentFallbackConfigEntity[];
}

export interface AIConfigVersionEntity {
  id: string;
  version: number;
  status: AIConfigVersionStatus;
  name?: string | null;
  description?: string | null;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  agentConfigs?: AgentConfigEntity[];
}

export interface AIAuditLogEntity {
  id: string;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  versionId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}
