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

export interface AIProvider {
  id: string;
  slug: string;
  name: string;
  type: AIProviderType;
  status: AIProviderStatus;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    models: number;
    credentials: number;
  };
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  modelId: string;
  type: AIProviderType;
  status: AIProviderStatus;
  metadata?: Record<string, any> | null;
  provider?: AIProvider;
  createdAt: string;
}

export interface AICredential {
  id: string;
  providerId: string;
  name: string;
  lastFour: string;
  status: AICredentialStatus;
  configured: boolean;
  lastUsedAt?: string | null;
  lastTestedAt?: string | null;
  lastTestStatus?: string | null;
  lastTestLatency?: number | null;
  provider?: AIProvider;
  createdAt: string;
}

export interface AgentFallbackConfig {
  id?: string;
  priority: number;
  modelId: string;
  credentialId: string;
  temperature?: number;
  customConfig?: Record<string, any>;
  model?: AIModel;
  credential?: AICredential;
}

export interface AgentConfig {
  id?: string;
  agentType: AIAgentType;
  modelId: string;
  credentialId: string;
  enabled: boolean;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
  customConfig?: Record<string, any>;
  model?: AIModel;
  credential?: AICredential;
  fallbackConfigs?: AgentFallbackConfig[];
}

export interface AIConfigVersion {
  id: string;
  version: number;
  status: AIConfigVersionStatus;
  name?: string | null;
  description?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt: string;
  agentConfigs?: AgentConfig[];
}

export interface AIAuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  versionId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  version?: {
    version: number;
    name?: string;
  };
}

export interface ProviderHealthTestResult {
  valid: boolean;
  provider: string;
  checkedAt: string;
  latencyMs: number;
  message?: string;
  error?: string;
}
